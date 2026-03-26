import { DEFAULT_COLOR } from "@/utils/constant";
import { clamp } from "@/utils/helper";
import { buildOklchStr, oklchToHex, parseOklchStr } from "@/utils/oklch";
import { OklchColor } from "@/utils/types";
import { EditIcon, ResetIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { formatHex, oklch as toOklch, parse } from "culori";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { set, unset } from "sanity";
import type { StringInputProps } from "sanity";
import styled from "styled-components";

// ─── Styled primitives ────────────────────────────────────────────────────────

/**
 * A pure-CSS slider track. The actual thumb interaction is handled via pointer
 * events on the wrapping <SliderRoot> div so we get smooth, gap-free dragging
 * even when the pointer moves faster than the browser fires mousemove.
 */
const SliderTrack = styled.div<{ $gradient: string }>`
  position: relative;
  width: 100%;
  height: 14px;
  border-radius: 7px;
  background: ${(p) => p.$gradient};
  cursor: pointer;
  touch-action: none; /* prevents scroll interference on mobile */
`;

const SliderThumb = styled.div<{ $pct: number }>`
  position: absolute;
  top: 50%;
  left: ${(p) => p.$pct}%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  pointer-events: none; /* let the parent track receive all pointer events */
  will-change: left; /* promotes to its own compositor layer → no repaints */
`;

const NoSpinInput = styled.input`
  width: 50px;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-family: monospace;
  background: transparent;
  border: none;
  outline: none;
  font-size: 11px;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  appearance: textfield;
  -moz-appearance: textfield;

  &:focus {
    background: var(--card-muted-bg-color);
    color: var(--card-accent-fg-color);
    border-radius: 3px;
  }
`;



// ─── Picker reducer ───────────────────────────────────────────────────────────

type PickerAction =
  | { type: "init"; payload: OklchColor }
  | { type: "setL"; value: number }
  | { type: "setC"; value: number }
  | { type: "setH"; value: number }
  | { type: "setA"; value: number }
  | { type: "setHex"; hex: string; l: number; c: number; h: number }
  | { type: "setHexInput"; hex: string };

function pickerReducer(state: OklchColor, action: PickerAction): OklchColor {
  switch (action.type) {
    case "init":
      return action.payload;
    case "setL": {
      const l = action.value;
      return { ...state, l, hexInput: oklchToHex(l, state.c, state.h) };
    }
    case "setC": {
      const c = action.value;
      return { ...state, c, hexInput: oklchToHex(state.l, c, state.h) };
    }
    case "setH": {
      const h = action.value;
      return { ...state, h, hexInput: oklchToHex(state.l, state.c, h) };
    }
    case "setA":
      return { ...state, a: action.value };
    case "setHex":
      return {
        ...state,
        hexInput: action.hex,
        l: action.l,
        c: action.c,
        h: action.h,
      };
    case "setHexInput":
      return { ...state, hexInput: action.hex };
  }
}

// ─── Slider ─────────────────────────────────────────────────────────────
/**
 * A pointer-event-driven slider that stays silky-smooth even during fast drags.
 *
 * Key ideas:
 *  • We use `setPointerCapture` so the element keeps receiving pointermove
 *    even when the cursor leaves its bounds (no more "thumb getting stuck").
 *  • The thumb position is stored in a ref and written directly to DOM style
 *    during the drag, bypassing React's render cycle entirely.
 *  • `onChange` is only called during moves (not just on pointer-up), so the
 *    preview swatch stays live.
 *  • Because we skip React state during dragging, the parent component
 *    (OklchColorPickerModal) also doesn't re-render mid-drag — only the
 *    thumb div moves.
 */
const Slider = memo(function Slider({
  label,
  value,
  min,
  max,
  step,
  gradient,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  gradient: string;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /** Convert a clientX position to a clamped, stepped value. */
  const clientXToValue = useCallback(
    (clientX: number): number => {
      const rect = trackRef.current!.getBoundingClientRect();
      const raw = (clientX - rect.left) / rect.width; // 0..1
      const clamped = clamp(raw, 0, 1);
      const scaled = clamped * (max - min) + min;
      // Snap to step
      const stepped = Math.round((scaled - min) / step) * step + min;
      return clamp(stepped, min, max);
    },
    [min, max, step],
  );

  /** Imperatively move the thumb without re-rendering. */
  const moveThumb = useCallback(
    (v: number) => {
      if (thumbRef.current) {
        const pct = ((v - min) / (max - min)) * 100;
        thumbRef.current.style.left = `${pct}%`;
      }
    },
    [min, max],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDragging.current = true;
      trackRef.current!.setPointerCapture(e.pointerId);
      const v = clientXToValue(e.clientX);
      moveThumb(v);
      onChangeRef.current(v);
    },
    [clientXToValue, moveThumb],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      const v = clientXToValue(e.clientX);
      moveThumb(v);
      onChangeRef.current(v);
    },
    [clientXToValue, moveThumb],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleNumberChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = clamp(parseFloat(e.target.value), min, max);
      if (!isNaN(v)) onChange(v);
    },
    [onChange, min, max],
  );

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <Flex
      align="center"
      gap={2}
    >
      <Text
        size={0}
        weight="semibold"
        style={{ width: 16, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {label}
      </Text>

      <Box flex={1}>
        <SliderTrack
          ref={trackRef}
          $gradient={gradient}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <SliderThumb
            ref={thumbRef}
            $pct={pct}
          />
        </SliderTrack>
      </Box>

      <NoSpinInput
        type="number"
        min={min}
        max={max}
        step={step}
        value={label === "H" ? value.toFixed(0) : value.toFixed(3)}
        onChange={handleNumberChange}
      />
    </Flex>
  );
});

// ─── OklchColorPickerModal ────────────────────────────────────────────────────

interface OklchColorPickerModalProps {
  dialogId: string;
  initialValue: string | undefined;
  onSave: (oklchStr: string) => void;
  onClose: () => void;
}

export const OklchColorPickerModal = memo(function OklchColorPickerModal({
  dialogId,
  initialValue,
  onSave,
  onClose,
}: OklchColorPickerModalProps) {
  const [picker, dispatch] = useReducer(pickerReducer, undefined, () =>
    parseOklchStr(initialValue),
  );
  const { l, c, h, a, hexInput } = picker;

  // Stable channel setters.
  const setL = useCallback(
    (v: number) => dispatch({ type: "setL", value: v }),
    [],
  );
  const setC = useCallback(
    (v: number) => dispatch({ type: "setC", value: v }),
    [],
  );
  const setH = useCallback(
    (v: number) => dispatch({ type: "setH", value: v }),
    [],
  );
  const setA = useCallback(
    (v: number) => dispatch({ type: "setA", value: v }),
    [],
  );

  const ls = l.toFixed(3);
  const cs = c.toFixed(3);
  const hs = h.toFixed(1);

  const previewColor = buildOklchStr(l, c, h, a);

  const lGradient = useMemo(
    () =>
      `linear-gradient(to right, oklch(0 ${cs} ${hs}), oklch(0.5 ${cs} ${hs}), oklch(1 ${cs} ${hs}))`,
    [cs, hs],
  );
  const cGradient = useMemo(
    () =>
      `linear-gradient(to right, oklch(${ls} 0 ${hs}), oklch(${ls} 0.4 ${hs}))`,
    [ls, hs],
  );
  const hGradient = useMemo(() => {
    const effC = Math.max(c, 0.15).toFixed(3);
    const stops = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]
      .map((deg) => `oklch(${ls} ${effC} ${deg})`)
      .join(", ");
    return `linear-gradient(to right, ${stops})`;
  }, [ls, c]);
  const aGradient = useMemo(
    () =>
      `linear-gradient(to right, oklch(${ls} ${cs} ${hs} / 0), oklch(${ls} ${cs} ${hs}))`,
    [ls, cs, hs],
  );

  const hexPreview = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hexInput)
    ? hexInput
    : "transparent";

  const currentHex = useMemo(
    () => (hexPreview !== "transparent" ? hexPreview : "#000000"),
    [hexPreview],
  );

  const safeHex = useMemo(
    () => (/^#[0-9a-fA-F]{6}$/.test(currentHex) ? currentHex : "#000000"),
    [currentHex],
  );

  const handleHexChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(hex) || /^#[0-9a-fA-F]{3}$/.test(hex)) {
      try {
        const converted = toOklch(parse(hex));
        if (converted) {
          dispatch({
            type: "setHex",
            hex,
            l: converted.l ?? 0.5,
            c: converted.c ?? 0,
            h: converted.h ?? 0,
          });
          return;
        }
      } catch {
        /* ignore invalid input */
      }
    }
    dispatch({ type: "setHexInput", hex });
  }, []);

  /** Called by HexPickerModal as the native color input changes. */
  const handleNativeHexChange = useCallback((hex: string) => {
    try {
      const converted = toOklch(parse(hex));
      if (converted) {
        dispatch({
          type: "setHex",
          hex,
          l: converted.l ?? 0.5,
          c: converted.c ?? 0,
          h: converted.h ?? 0,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const previewColorRef = useRef(previewColor);
  previewColorRef.current = previewColor;

  const handleSave = useCallback(
    () => onSave(previewColorRef.current),
    [onSave],
  );

  return (
    <>
      <Dialog
        header="Velg farge"
        id={dialogId}
        onClose={onClose}
        open
        width={0}
      >
        <Box
          paddingX={4}
          paddingBottom={4}
        >
          <Stack space={4}>
            {/* Live preview swatch */}
            <Box
              style={{
                height: 72,
                borderRadius: 8,
                background: previewColor,
                border: "1px solid var(--card-border-color)",
              }}
            />

            {/* Sliders */}
            <Stack space={3}>
              <Slider
                label="L"
                value={l}
                min={0}
                max={1}
                step={0.001}
                gradient={lGradient}
                onChange={setL}
              />
              <Slider
                label="C"
                value={c}
                min={0}
                max={0.4}
                step={0.001}
                gradient={cGradient}
                onChange={setC}
              />
              <Slider
                label="H"
                value={h}
                min={0}
                max={360}
                step={0.5}
                gradient={hGradient}
                onChange={setH}
              />
              <Slider
                label="A"
                value={a}
                min={0}
                max={1}
                step={0.01}
                gradient={aGradient}
                onChange={setA}
              />
            </Stack>

            <Stack space={2}>
              {/* HEX input row */}
              <Flex
                align="center"
                gap={1}
              >
                <Text
                  size={1}
                  style={{ width: 40, flexShrink: 0 }}
                >
                  HEX
                </Text>
                <Box flex={1}>
                  <TextInput
                    value={hexInput}
                    onChange={handleHexChange}
                    placeholder="#000000"
                    fontSize={1}
                    style={{
                      fontFamily: "monospace",
                      paddingTop: 4,
                      paddingBottom: 4,
                    }}
                  />
                </Box>

                <Card
                  border
                  padding={0}
                  style={{
                    overflow: "hidden",
                    height: 27,
                    width: 30,
                    position: "relative",
                  }}
                  radius={2}
                >
                  <input
                    type="color"
                    value={safeHex}
                    onChange={(e) => handleNativeHexChange(e.target.value)}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background: "none",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </Card>
              </Flex>

              {/* OKLCH string */}
              <Box
                padding={2}
                style={{
                  background: "var(--card-code-bg-color, #f4f4f4)",
                  borderRadius: 4,
                }}
              >
                <Text
                  size={1}
                  style={{ fontFamily: "monospace" }}
                >
                  {previewColor}
                </Text>
              </Box>
            </Stack>

            {/* Actions */}
            <Flex
              gap={2}
              justify="flex-end"
            >
              <Button
                text="Avbryt"
                mode="ghost"
                onClick={onClose}
                paddingY={2}
                fontSize={1}
              />
              <Button
                text="Lagre"
                tone="primary"
                onClick={handleSave}
                paddingY={2}
                fontSize={1}
              />
            </Flex>
          </Stack>
        </Box>
      </Dialog>
    </>
  );
});

// ─── OklchColorInput ──────────────────────────────────────────────────────────

interface OklchColorInputProps extends StringInputProps {
  optional?: boolean;
}

export const OklchColorInput = memo(function OklchColorInput(props: OklchColorInputProps) {
  const { value, onChange, readOnly, optional, path } = props;

  const [open, setOpen] = useState(false);

  const dialogId = useMemo(
    () => `oklch-picker-${path.map(String).join("-")}`,
    [path],
  );

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleReset = useCallback(() => onChange(unset()), [onChange]);

  const handleSave = useCallback(
    (oklchStr: string) => {
      onChange(set(oklchStr));
      setOpen(false);
    },
    [onChange],
  );

  const isEmpty = value === undefined || value === null || value === "";

  return (
    <>
      <Flex
        align="center"
        gap={2}
      >
        {/* Swatch */}
        <Box
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            flexShrink: 0,
            background: isEmpty
              ? "repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%) 0 0 / 8px 8px"
              : (value as string),
            border: "1px solid var(--card-border-color)",
          }}
        />

        {/* Value text */}
        <Box
          flex={1}
          style={{ minWidth: 0 }}
        >
          {isEmpty && optional ? (
            <Text
              size={1}
              muted
              style={{ fontStyle: "italic" }}
            >
              Arver fra globalt tema
            </Text>
          ) : (
            <Text
              size={1}
              style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {(value as string) || "—"}
            </Text>
          )}
        </Box>

        {optional && !isEmpty && !readOnly && (
          <Button
            icon={ResetIcon}
            mode="ghost"
            tone="critical"
            padding={2}
            title="Tilbakestill til globalt tema"
            onClick={handleReset}
          />
        )}

        {!readOnly && (
          <Button
            icon={EditIcon}
            mode="ghost"
            padding={2}
            title="Rediger farge"
            onClick={handleOpen}
          />
        )}
      </Flex>

      {open && (
        <OklchColorPickerModal
          dialogId={dialogId}
          initialValue={value as string | undefined}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </>
  );
})

// ─── Optional variant ─────────────────────────────────────────────────────────

export function OklchColorInputOptional(props: StringInputProps) {
  return (
    <OklchColorInput
      {...props}
      optional
    />
  );
}

import { useCallback } from "react"
import { set, unset } from "sanity"
import type { StringInputProps } from "sanity"
import { Stack, TextInput, Flex, Box, Text } from "@sanity/ui"
import { oklch, formatCss, parse, formatHex } from "culori"  // npm i culori

export function OklchColorInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props

  // Parse current oklch string back to a hex for the color picker
  const toHex = (oklchStr: string | undefined): string => {
    if (!oklchStr) return "#000000"
    try {
      const parsed = parse(oklchStr)
      if (!parsed) return "#000000"
      // culori can convert to hex via rgb
      return formatHex(parsed) ?? "#000000"
    } catch {
      return "#000000"
    }
  }

  const handleColorPicker = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      try {
        const converted = oklch(parse(hex))
        if (!converted) return
        const str = `oklch(${converted.l.toFixed(3)} ${converted.c.toFixed(3)} ${converted.h?.toFixed(1) ?? 0})`
        onChange(set(str))
      } catch {
        // ignore
      }
    },
    [onChange],
  )

  const handleTextInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      onChange(v ? set(v) : unset())
    },
    [onChange],
  )

  const hexValue = toHex(value)

  return (
    <Stack space={2}>
      <Flex gap={2} align="center">
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: value ?? "transparent",
            border: "1px solid var(--card-border-color)",
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <input
            type="color"
            value={hexValue}
            onChange={handleColorPicker}
            disabled={readOnly}
            style={{
              opacity: 0,
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
          />
        </Box>
        <Box flex={1}>
          <TextInput
            value={value ?? ""}
            onChange={handleTextInput}
            readOnly={readOnly}
            placeholder="oklch(0.985 0 0)"
          />
        </Box>
      </Flex>
      {value && (
        <Box
          style={{
            height: 8,
            borderRadius: 4,
            background: value,
          }}
        />
      )}
    </Stack>
  )
}
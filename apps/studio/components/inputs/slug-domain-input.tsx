import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Box,
    Button,
    Card,
    Flex,
    Stack,
    Text,
    TextInput,
    useToast,
    Code,
    Grid,
} from "@sanity/ui";
import { set, unset, useFormValue, type ObjectInputProps } from "sanity";
import {
    LinkIcon,
    EarthGlobeIcon,
    InfoOutlineIcon,
    CopyIcon,
    LaunchIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    SyncIcon,
} from "@sanity/icons";

// ─── Types ───────────────────────────────────────────────────────────────────

type TLD = ".no" | ".se" | ".dk";

// ─── DNS config per TLD ──────────────────────────────────────────────────────

const TLD_CONFIG: Record<
    TLD,
    {
        label: string;
        registry: string;
        note: string;
    }
> = {
    ".no": {
        label: "Norge (.no)",
        registry: "Norid",
        note: "Norid krever godkjente navneservere. Behold eksisterende navneservere og pek med A-record.",
    },
    ".se": {
        label: "Sverige (.se)",
        registry: "Internetstiftelsen",
        note: "Du kan enten peke med A-record eller bytte navneservere til Vercel.",
    },
    ".dk": {
        label: "Danmark (.dk)",
        registry: "Punktum.dk",
        note: "Punktum.dk krever forhåndsgodkjenning av navneservere. Vi anbefaler A-record.",
    },
};

const VERCEL_IP = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectTLD(domain: string): TLD | null {
    if (domain.endsWith(".no")) return ".no";
    if (domain.endsWith(".se")) return ".se";
    if (domain.endsWith(".dk")) return ".dk";
    return null;
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

function stripTLD(domain: string): string {
    return domain.replace(/\.(no|se|dk)$/, "");
}

// ─── Copy Value Component ────────────────────────────────────────────────────

function CopyValue({ label, value }: { label: string; value: string }) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);

    const onCopy = useCallback(() => {
        navigator.clipboard.writeText(value);
        toast.push({ status: "success", title: `${label} kopiert` });
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [label, value, toast]);

    return (
        <Card
            border
            radius={2}
            padding={2}
            onClick={onCopy}
            style={{ cursor: "pointer", transition: "background 0.15s" }}
        >
            <Flex
                align="center"
                justify="space-between"
                gap={2}
            >
                <Stack space={2}>
                    <Text
                        size={0}
                        muted
                        weight="bold"
                        style={{
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {label}
                    </Text>
                    <Code size={1}>{value}</Code>
                </Stack>
                <Text
                    size={0}
                    muted
                >
                    {copied ? "✓" : <CopyIcon />}
                </Text>
            </Flex>
        </Card>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SlugDomainInput(props: ObjectInputProps) {
    const { onChange, value, schemaType, path } = props;
    const [showDns, setShowDns] = useState(false);

    // ── Read values from the object value prop ──
    // The component receives the `siteIdentity` object value directly.
    // `slug` is a Sanity slug field → { _type: "slug", current: "..." }
    // `domain` is a plain string field
    const objectValue = (value as Record<string, unknown>) || {};
    const slugObj = objectValue.slug as
        | { _type?: string; current?: string }
        | undefined;
    const slugCurrent = slugObj?.current || "";
    const domainStr = (objectValue.domain as string) || "";

    const hasSlug = slugCurrent.length > 0;
    const hasDomain = domainStr.length > 0;

    const detectedTLD = hasDomain ? detectTLD(domainStr) : null;
    const tldConfig = detectedTLD ? TLD_CONFIG[detectedTLD] : null;

    const previewUrl = hasDomain
        ? `https://${domainStr}`
        : hasSlug
          ? `https://${slugCurrent}.example.com`
          : null;

    // ── Document title for slug generation ──
    // Sanity v5 ObjectInputProps includes the full document
    const documentTitle = (useFormValue(["site", "title"]) as string) || "";

    // ── Patch helpers ──
    // For an ObjectInputProps, we patch child fields by using `onChange` with
    // a `set` patch at the child field path.

    const handleSlugChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.currentTarget.value;
            const cleaned = slugify(raw);
            if (cleaned) {
                onChange(set({ _type: "slug", current: cleaned }, ["slug"]));
            } else {
                onChange(unset(["slug"]));
            }
        },
        [onChange],
    );

    const handleDomainChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.currentTarget.value.toLowerCase().trim();
            if (raw) {
                onChange(set(raw, ["domain"]));
            } else {
                onChange(unset(["domain"]));
            }
        },
        [onChange],
    );

    // Domain validation hint
    const domainValidation = useMemo(() => {
        if (!domainStr) return null;
        const pattern = /^[a-zA-Z0-9æøåäöüé-]+\.(no|se|dk)$/;
        if (!pattern.test(domainStr)) {
            return "Må være et gyldig .no, .se eller .dk-domene";
        }
        return null;
    }, [domainStr]);

    // ── Auto-populate slug from document title on creation ──
    // Only runs once when the slug is empty and the title is available
    const hasAutoPopulated = useRef(false);

    useEffect(() => {
        if (hasAutoPopulated.current) return;
        if (slugCurrent) return; // Already has a slug, don't overwrite
        if (!documentTitle) return; // No title yet

        const generated = slugify(documentTitle);
        if (generated) {
            onChange(set({ _type: "slug", current: generated }, ["slug"]));
            hasAutoPopulated.current = true;
        }
    }, [documentTitle, slugCurrent, onChange]);

    // ── Sync slug from domain (strip TLD) ──
    const canSyncFromDomain = hasDomain && !domainValidation;
    const domainSlug = canSyncFromDomain ? slugify(stripTLD(domainStr)) : "";
    const slugMatchesDomain = domainSlug === slugCurrent;

    const handleSyncFromDomain = useCallback(() => {
        if (!domainSlug) return;
        onChange(set({ _type: "slug", current: domainSlug }, ["slug"]));
    }, [onChange, domainSlug]);

    return (
        <Stack space={4}>
            {/* ── Slug Field ── */}
            <Stack space={2}>
                <Text
                    size={1}
                    weight="semibold"
                >
                    Nettadresse-ID
                </Text>
                <Text
                    size={0}
                    muted
                >
                    Brukes som subdomene for forhåndsvisning (f.eks.
                    terrassemarkise)
                </Text>
                <Flex
                    gap={2}
                    align="center"
                >
                    <Box flex={1}>
                        <TextInput
                            value={slugCurrent}
                            onChange={handleSlugChange}
                            placeholder="f.eks. terrassemarkise"
                            fontSize={1}
                            readOnly
                        />
                    </Box>
                    {canSyncFromDomain && !slugMatchesDomain && (
                        <Button
                            icon={SyncIcon}
                            mode="ghost"
                            tone="primary"
                            onClick={handleSyncFromDomain}
                            title={`Synk fra domene → ${domainSlug}`}
                            text="Synk"
                            fontSize={1}
                        />
                    )}
                </Flex>
                {canSyncFromDomain && !slugMatchesDomain && (
                    <Text
                        size={0}
                        muted
                    >
                        Slug stemmer ikke med domenet. Trykk «Synk» for å sette
                        til <strong>{domainSlug}</strong>.
                    </Text>
                )}
            </Stack>

            {/* ── Domain Field ── */}
            <Stack space={2}>
                <Text
                    size={1}
                    weight="semibold"
                >
                    Domene
                </Text>
                <Text
                    size={0}
                    muted
                >
                    Eget domene (.no, .se eller .dk)
                </Text>
                <Flex
                    gap={2}
                    align="center"
                >
                    <Box flex={1}>
                        <TextInput
                            value={domainStr}
                            onChange={handleDomainChange}
                            placeholder="f.eks. terrassemarkise.no"
                            fontSize={1}
                            customValidity={domainValidation || undefined}
                        />
                    </Box>
                    {previewUrl && (
                        <Button
                            as="a"
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            icon={LaunchIcon}
                            mode="ghost"
                            tone="primary"
                            title="Åpne nettsted"
                        />
                    )}
                </Flex>
                {domainValidation && (
                    <Text
                        size={0}
                        style={{ color: "var(--card-badge-caution-fg-color)" }}
                    >
                        {domainValidation}
                    </Text>
                )}
            </Stack>

            {/* ── DNS Info Panel ── */}
            {hasDomain && !domainValidation && (
                <Card
                    padding={0}
                    radius={2}
                    border
                    tone="transparent"
                >
                    {/* Collapsible header */}
                    <Card
                        padding={3}
                        radius={2}
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowDns((v) => !v)}
                    >
                        <Flex
                            align="center"
                            justify="space-between"
                        >
                            <Flex
                                align="center"
                                gap={3}
                            >
                                <EarthGlobeIcon />
                                <Stack space={2}>
                                    <Text
                                        size={1}
                                        weight="semibold"
                                    >
                                        DNS for {domainStr}
                                    </Text>
                                    {tldConfig && (
                                        <Text
                                            size={0}
                                            muted
                                        >
                                            {tldConfig.registry} ·{" "}
                                            {tldConfig.label}
                                        </Text>
                                    )}
                                </Stack>
                            </Flex>
                            <Text
                                size={1}
                                muted
                            >
                                {showDns ? (
                                    <ChevronDownIcon />
                                ) : (
                                    <ChevronRightIcon />
                                )}
                            </Text>
                        </Flex>
                    </Card>

                    {/* Expanded DNS details */}
                    {showDns && (
                        <Box
                            padding={3}
                            paddingTop={0}
                        >
                            <Stack space={3}>
                                {tldConfig && (
                                    <Card
                                        padding={3}
                                        radius={2}
                                        tone="caution"
                                    >
                                        <Flex
                                            align="flex-start"
                                            gap={2}
                                        >
                                            <Box paddingTop={1}>
                                                <InfoOutlineIcon />
                                            </Box>
                                            <Text
                                                size={0}
                                                muted
                                            >
                                                {tldConfig.note}
                                            </Text>
                                        </Flex>
                                    </Card>
                                )}

                                <Box>
                                    <Box paddingBottom={2}>
                                        <Text
                                            size={0}
                                            weight="bold"
                                            muted
                                            style={{
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            Sett opp hos registrar
                                        </Text>
                                    </Box>
                                    <Grid
                                        columns={[1, 2]}
                                        gap={2}
                                    >
                                        <CopyValue
                                            label="A-Record (@)"
                                            value={VERCEL_IP}
                                        />
                                        <CopyValue
                                            label="CNAME (www)"
                                            value={VERCEL_CNAME}
                                        />
                                    </Grid>
                                </Box>

                                <Flex
                                    align="center"
                                    gap={2}
                                >
                                    <LinkIcon />
                                    <Text
                                        size={0}
                                        muted
                                    >
                                        Pek domenet ditt til verdiene over hos
                                        din registrar
                                        {tldConfig
                                            ? ` (${tldConfig.registry})`
                                            : ""}
                                        .
                                    </Text>
                                </Flex>
                            </Stack>
                        </Box>
                    )}
                </Card>
            )}

            {/* ── Empty state hint ── */}
            {!hasDomain && (
                <Card
                    padding={3}
                    radius={2}
                    tone="transparent"
                    border
                    style={{ borderStyle: "dashed" }}
                >
                    <Flex
                        align="center"
                        gap={3}
                    >
                        <InfoOutlineIcon />
                        <Text
                            size={1}
                            muted
                        >
                            Skriv inn et domene for å se DNS-instruksjoner.
                        </Text>
                    </Flex>
                </Card>
            )}
        </Stack>
    );
}

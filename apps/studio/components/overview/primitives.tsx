import React from 'react'
import { Badge, Card, Flex, Stack, Text } from '@sanity/ui'
import styled from 'styled-components'

// ─── Typography Helpers ────────────────────────────────────────────────────────

/** Small-caps section label – uppercase, muted, tracking */
export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    size={0}
    weight="semibold"
    muted
    style={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}
  >
    {children}
  </Text>
)

// ─── Status Dot ────────────────────────────────────────────────────────────────

const DOT_COLORS: Record<string, string> = {
  // Use 'fg-color' for text/icons to ensure they pop against the background
  positive: "var(--card-stat-status-positive-fg-color)",
  caution: "var(--card-stat-status-caution-fg-color)",
  critical: "var(--card-stat-status-critical-fg-color)",

  // 'accent-fg-color' is the standard Sanity blue
  default: "var(--card-accent-fg-color)",

  // 'muted-fg-color' is the standard gray for secondary info
  muted: "var(--card-muted-fg-color)",
};

interface StatusDotProps {
  tone: 'positive' | 'caution' | 'critical' | 'default' | 'muted'
  size?: number
  pulse?: boolean
}

export const StatusDot = ({ tone, size = 12, pulse = false }: StatusDotProps) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      backgroundColor: DOT_COLORS[tone] ?? DOT_COLORS.default,
      boxShadow: pulse && tone !== 'default' && tone !== 'muted'
        ? `0 0 0 3px ${DOT_COLORS[tone]}33`
        : undefined,
    }}
  />
)

// ─── Score Ring ────────────────────────────────────────────────────────────────

const scoreColor = (s: number) =>
  s >= 90 ? '#3ec97e' : s >= 70 ? '#f0ad4e' : '#e5534b'

export const ScoreRing = ({ score, size = 56 }: { score: number; size?: number }) => {
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const color = scoreColor(score)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card-border-color)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text size={1} weight="semibold" style={{ color }}>{score}</Text>
      </div>
    </div>
  )
}

// ─── Score Bar ─────────────────────────────────────────────────────────────────

export const ScoreBar = ({ value, height = 3 }: { value: number; height?: number }) => (
  <div style={{ height, backgroundColor: 'var(--card-border-color)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
    <div
      style={{
        width: `${value}%`,
        height: '100%',
        borderRadius: 2,
        backgroundColor: scoreColor(value),
        transition: 'width 0.4s ease',
      }}
    />
  </div>
)

// ─── Trend Badge ────────────────────────────────────────────────────────────────

const TREND_MAP = {
  up:     { label: '↑', tone: 'positive' as const },
  down:   { label: '↓', tone: 'critical' as const },
  stable: { label: '→', tone: 'default' as const },
}

export const TrendBadge = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => (
  <Badge tone={TREND_MAP[trend].tone} fontSize={0} padding={2}>
    {TREND_MAP[trend].label}
  </Badge>
)

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  tone?: 'default' | 'positive' | 'caution' | 'critical'
  sublabel?: string
}

export const StatCard = ({ label, value, tone, sublabel }: StatCardProps) => (
  <Card padding={4} radius={2} border tone={tone !== 'default' ? tone : undefined}>
    <Stack space={2}>
      <SectionLabel>{label}</SectionLabel>
      <Text size={4} weight="bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      {sublabel && <Text size={0} muted>{sublabel}</Text>}
    </Stack>
  </Card>
)

// ─── Table Helpers ──────────────────────────────────────────────────────────────


const TableContainer = styled(Card)`
  overflow-x: auto;
  width: 100%;
  border-radius: 4px;
`;

// 2. Ensure the table doesn't shrink smaller than your defined widths
const StyledTable = styled.table<{ $minWidth?: string }>`
  width: 100%;
  border-collapse: collapse;
  /* This prevents the table from squishing columns below their content size */
  min-width: ${props => props.$minWidth ? props.$minWidth : "800px"};
`;

const StyledThead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--card-bg-color);
  box-shadow: inset 0 -1px 0 var(--card-border-color);
`;

const StyledTh = styled.th`
  padding: 12px 14px;
  white-space: nowrap;
`;


const StyledTd = styled.td`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--card-border-color);
  white-space: nowrap; // Keeps the table from wrapping text ugly
  vertical-align: middle;
`;

export const THead = ({ children }: { children: React.ReactNode }) => (
  <StyledThead>
    <tr>{children}</tr>
  </StyledThead>
);

export const Th = ({
  children,
  align = "left",
  width,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: number | string;
}) => (
  <StyledTh style={{ textAlign: align, width }}>
    <Text
      size={0}
      weight="bold"
      muted
      style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
    >
      {children}
    </Text>
  </StyledTh>
);


interface TdProps {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
}
export const Td = ({ children, align = "left", mono = false }: TdProps) => (
  <StyledTd style={{ textAlign: align }}>
    <Text
      size={1}
      style={{
        fontFamily: mono ? "var(--lucide-font-mono)" : undefined,
        // tabular-nums is essential for aligning numbers in rows
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </Text>
  </StyledTd>
);

interface DataTableProps {
  children: React.ReactNode;
  summary?: string;
  minWidth?: string;
}

export const DataTable = ({
  children,
  summary,
  minWidth
}: DataTableProps) => (
  <Card
    radius={2}
    border
    overflow="auto"
  >
    <StyledTable $minWidth={minWidth} summary={summary}>{children}</StyledTable>
  </Card>
);

// ─── Empty State ────────────────────────────────────────────────────────────────

export const EmptyState = ({ message }: { message: string }) => (
  <Flex align="center" justify="center" padding={6}>
    <Text size={1} muted>{message}</Text>
  </Flex>
)

// ─── Left-accented Card ─────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<string, string> = {
  positive: 'var(--green-500)',
  caution:  'var(--yellow-500)',
  critical: 'var(--red-500)',
  info:     'var(--blue-500)',
  default:  'var(--card-border-color)',
}

interface AccentCardProps {
  tone: 'positive' | 'caution' | 'critical' | 'info' | 'default'
  children: React.ReactNode
  padding?: number
}

export const AccentCard = ({ tone, children, padding = 4 }: AccentCardProps) => (
  <Card
    padding={padding}
    radius={2}
    border
    style={{ borderLeft: `3px solid ${ACCENT_COLORS[tone] ?? ACCENT_COLORS.default}` }}
  >
    {children}
  </Card>
)

// ─── Inline Badge helpers ───────────────────────────────────────────────────────

export const HttpStatusBadge = ({ status }: { status: number }) => (
  <Badge
    tone={status < 300 ? 'positive' : status < 500 ? 'caution' : 'critical'}
    fontSize={0}
    style={{ fontVariantNumeric: 'tabular-nums' }}
  >
    {status}
  </Badge>
)

export const SslBadge = ({ status }: { status: 'valid' | 'pending' | 'invalid' }) => {
  const map = { valid: { tone: 'positive' as const, label: 'Gyldig' }, pending: { tone: 'caution' as const, label: 'Ventende' }, invalid: { tone: 'critical' as const, label: 'Ugyldig' } }
  const { tone, label } = map[status]
  return <Badge tone={tone} fontSize={0}>{label}</Badge>
}

export const DnsBadge = ({ mismatch }: { mismatch: boolean }) => (
  <Badge tone={mismatch ? 'critical' : 'positive'} fontSize={0}>
    {mismatch ? 'Mismatch' : 'OK'}
  </Badge>
)

import { useCopy } from "@/hooks/useCopy";
import { CopyIcon, CheckmarkIcon } from "@sanity/icons";
import { Button, Tooltip, Box, Text, TooltipProps, TextProps } from "@sanity/ui"; // Assuming Sanity UI based on your snippet

interface CopyButtonProps {
  value: string;
  size?: number; // Scales the button and icon
  tooltip?: string;
  tooltipPlacement?: TooltipProps["placement"]
  tooltipTextSize?: TextProps["size"]
}

export const CopyButton = ({
  value,
  size = 18,
  tooltip = "Kopier",
  tooltipPlacement = "top",
  tooltipTextSize = 0
}: CopyButtonProps) => {
  const { copy, hasCopied } = useCopy();

  const buttonStyle = {
    width: size,
    height: size,
  };

  return (
    <Tooltip
      content={<Text size={tooltipTextSize}>{hasCopied ? "Kopiert!" : tooltip}</Text>}
      portal
      placement={tooltipPlacement}
    >
      <button
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          margin: 0
        }}
        onClick={(e) => {
          e.stopPropagation();
          copy(value);
        }}
      >
        <Text
          muted
          size={0}
        >
          {hasCopied ? (
            <CheckmarkIcon style={buttonStyle} />
          ) : (
            <CopyIcon style={buttonStyle} />
          )}
        </Text>
      </button>
    </Tooltip>
  );
};

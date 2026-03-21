import React from "react";

export interface DividerProps {
  direction?: "horizontal" | "vertical";
  thickness?: number | string;
  length?: number | string; // Width for horizontal, Height for vertical
  color?: string;
  opacity?: number;
  radius?: string;
  margin?: string | number;
}

export const Divider = ({
  direction = "vertical",
  thickness = 2,
  length = 12,
  color = "var(--card-muted-fg-color)",
  opacity = 0.4,
  radius = "100vw",
  margin = 0,
}: DividerProps) => {
  const isVertical = direction === "vertical";

  const style: React.CSSProperties = {
    // Layout logic
    width: isVertical ? thickness : length,
    height: isVertical ? length : thickness,

    // Visuals
    backgroundColor: color,
    opacity,
    borderRadius: radius,
    margin,

    // Ensure it doesn't shrink in Flex containers
    flexShrink: 0,
  };

  return (
    <div
      style={style}
      aria-hidden="true"
    />
  );
};

import { Card } from "@sanity/ui";
import styled from "styled-components";

export const HoverCard = styled(Card)`
  position: relative;
  transition: background 120ms ease-in-out;
  cursor: default;

  .show-on-card-hover {
    opacity: 0;
    transition: opacity 120ms ease-in-out;
    pointer-events: none;
  }

  &:hover {
    background: var(--card-bg-color);
    filter: brightness(0.92);

    .show-on-card-hover {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &[data-hovered] {
    background-color: var(--card-muted-bg-color);
  }
`;
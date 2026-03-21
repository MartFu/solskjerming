import { useCallback, useReducer } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionView = { type: "summary" } | { type: "detail"; id: string };

export type DrilldownSection = "pages" | "config" | "shared";

type DrilldownState = Record<DrilldownSection, SectionView>;

type DrilldownAction =
  | { type: "DRILL"; section: DrilldownSection; id: string }
  | { type: "BACK"; section: DrilldownSection };

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: DrilldownState = {
  pages: { type: "summary" },
  config: { type: "summary" },
  shared: { type: "summary" },
};

function drilldownReducer(
  state: DrilldownState,
  action: DrilldownAction,
): DrilldownState {
  switch (action.type) {
    case "DRILL":
      return { ...state, [action.section]: { type: "detail", id: action.id } };
    case "BACK":
      return { ...state, [action.section]: { type: "summary" } };
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDrilldownState() {
  const [state, dispatch] = useReducer(drilldownReducer, initialState);

  const drill = useCallback((section: DrilldownSection, id: string) => {
    dispatch({ type: "DRILL", section, id });
  }, []);

  const back = useCallback((section: DrilldownSection) => {
    dispatch({ type: "BACK", section });
  }, []);

  return { state, drill, back };
}

export type { SectionView, DrilldownState };

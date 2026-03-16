import { useEffect, useMemo } from "react";
import { usePaneRouter } from "sanity/structure";

export function AutoSplitPreview() {
  const {
    routerPanesState,
    groupIndex,
    siblingIndex,
    duplicateCurrent,
    setView,
  } = usePaneRouter();

  const currentGroup = useMemo(
    () => routerPanesState[groupIndex],
    [routerPanesState, groupIndex],
  );

  useEffect(() => {
    // Only duplicate if we are the only pane in this group
    if (currentGroup.length === 1 && siblingIndex === 0) {
      duplicateCurrent({ params: { view: "forhandsvisning" } });
    }
  }, [currentGroup, duplicateCurrent, siblingIndex]);

  return null;
}

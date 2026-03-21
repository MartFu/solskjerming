import { useState, useCallback } from "react";

export function useCopy(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const copy = useCallback(
    async (value: string | number) => {
      try {
        await navigator.clipboard.writeText(value.toString());
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), timeout);
        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setHasCopied(false);
        return false;
      }
    },
    [timeout],
  );

  return { copy, hasCopied };
}

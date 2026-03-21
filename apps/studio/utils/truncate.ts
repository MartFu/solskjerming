interface TruncateOptions {
  /** Maximum length of the string including the suffix */
  length: number;
  /** Custom suffix, defaults to '...' */
  suffix?: string;
  /** * Where to truncate:
   * 'end' (default): Truncates the end
   * 'middle': Keeps start and end, truncates middle
   * 'smart': Attempts to truncate at the last full word
   */
  location?: "end" | "middle" | "smart";
}

/**
 * A typesafe utility to truncate text with multiple strategies.
 */
export function truncateText(
  text: string | null | undefined,
  options: TruncateOptions,
): string {
  if (!text) return "";

  const { length, suffix = "...", location = "end" } = options;

  if (text.length <= length) return text;

  const suffixLength = suffix.length;
  const effectiveLength = length - suffixLength;

  if (effectiveLength <= 0) return text.substring(0, length);

  switch (location) {
    case "middle": {
      const startChars = Math.ceil(effectiveLength / 2);
      const endChars = Math.floor(effectiveLength / 2);
      return (
        text.substring(0, startChars) +
        suffix +
        text.substring(text.length - endChars)
      );
    }

    case "smart": {
      const substring = text.substring(0, effectiveLength);
      const lastSpace = substring.lastIndexOf(" ");
      if (lastSpace > effectiveLength * 0.5) {
        return substring.substring(0, lastSpace) + suffix;
      }
      // Fallback to end truncation if no good word break is found
      return substring + suffix;
    }

    case "end":
    default:
      return text.substring(0, effectiveLength) + suffix;
  }
}

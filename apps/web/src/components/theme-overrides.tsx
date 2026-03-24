import { generateThemeOverrides } from "@/lib/generate-theme-overrides";
import { QuerySiteConfigResult } from "@workspace/sanity/types";

export function ThemeOverrides({
    theme,
}: {
    theme?: NonNullable<QuerySiteConfigResult>["theme"];
}) {
    const themeOverrides =
        theme && (theme?.dark || theme?.light)
            ? generateThemeOverrides(theme)
            : null;

    if (!themeOverrides) {
        return null;
    }

    return (
        <style
            id="theme-overrides"
            dangerouslySetInnerHTML={{ __html: themeOverrides }}
        />
    );
}

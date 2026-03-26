import { useToolLayout } from "@/context/ToolLayoutProvider";
import { asStudioIcon } from "@/utils/helper";
import { EarthGlobeIcon, WarningOutlineIcon } from "@sanity/icons";
import { Badge, Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { Frown, GlobeLock, Wrench } from "lucide-react";
import { FormNodeValidation, ReferenceInputProps, set } from "sanity";

export function SiteRelationFieldInput({
  validation,
  onChange,
  value,
}: ReferenceInputProps) {
  const { activeSite } = useToolLayout();
  const siteId = activeSite?._id ?? "";
  const hasError = validation.some(
    (v: FormNodeValidation) => v.level === "error",
  );
  const isLinked = value?._ref === siteId;

  return (
    <Stack space={0}>
      <Card
        padding={3}
        border
        radius={2}
        tone={isLinked ? "neutral" : "caution"}
        style={{ borderStyle: isLinked ? "solid" : "dashed" }}
      >
        <Flex
          align="center"
          gap={3}
        >
          {/* Visual Icon */}
          <Box>
            {isLinked ? (
              <EarthGlobeIcon fontSize={24} />
            ) : (
              <Frown fontSize={24} />
            )}
          </Box>

          {/* Site Info */}
          <Stack
            flex={1}
            space={2}
          >
            <Text
              size={1}
              weight="semibold"
            >
              {isLinked ? activeSite?.title : "Ingen nettsted tilkoblet"}
            </Text>
            <Text
              size={1}
              muted
              style={{ fontFamily: isLinked ? "monospace" : ""}}
            >
              {isLinked
                ? `ID: ${siteId}`
                : "Dette dokumentet må kobles til aktivt nettsted"}
            </Text>
          </Stack>

          {/* Action Button */}
          {!isLinked && (
            <Button
              fontSize={1}
              padding={3}
              tone="positive"
              text="Koble til"
              icon={asStudioIcon(Wrench)}
              onClick={() =>
                onChange(set({ _type: "reference", _ref: siteId }))
              }
            />
          )}

          {isLinked && <Badge tone="positive">Tilkoblet</Badge>}
        </Flex>
      </Card>

      <Box paddingX={4}>
        {hasError && (
          <Card
            borderBottom
            borderLeft
            borderRight
            radius={2}
            paddingY={1}
            paddingX={3}
            tone="critical"
          >
            <Flex
              gap={2}
              justify="flex-start"
              align="center"
            >
                <WarningOutlineIcon
                  style={{ flexShrink: 0 }}
                  fontSize={16}
                />
              {validation.map((v, i) => {
                if (v.level === "error" && i === 0) {
                  return (
                    <Text
                      key={`site-rel-val-err-${i}`}
                      size={0}
                      muted
                    >
                      {v.message}
                    </Text>
                  );
                }
              })}
            </Flex>
          </Card>
        )}
      </Box>
    </Stack>
  );
}

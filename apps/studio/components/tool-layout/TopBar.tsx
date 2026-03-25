import { Button, Card, Flex, Tooltip, Text } from "@sanity/ui";
import { ChevronLeftIcon, EyeClosedIcon, EyeOpenIcon } from "@sanity/icons";
import { useState } from "react";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { SiteCombobox } from "./SiteCombobox";
import { ConfirmDialog } from "./ConfirmDialog";
import { TabBar } from "./TabBar";
import { useRouter } from "sanity/router";
import { Tool } from "sanity";

interface TopBarProps {
  tool: Tool<any>
  isDirty?: boolean;
}

export function TopBar({ isDirty = false }: TopBarProps) {
  const {
    clearSite,
    previewUrl,
    togglePreviewHidden,
    previewHidden,
    hidePreview,
  } = useToolLayout();
  const [confirmBack, setConfirmBack] = useState(false);
  const router  = useRouter();

  const handleBack = () => {
    if (isDirty) {
      setConfirmBack(true);
    } else {
      clearSite();
      hidePreview();
    }
  };

  return (
    <>
      <Card
        borderBottom
        paddingX={2}
        paddingY={0}
        style={{ marginTop: -1, height: "49px" }}
      >
        <Flex
          flex={1}
          height={"fill"}
          align="center"
          justify="space-between"
          gap={2}
        >
          {/* ── Left zone: back + site switcher ── */}
          <Flex
            align="center"
            gap={3}
            flex={1}
          >
            <Tooltip
              content={
                <Text
                  size={1}
                >
                  Tilbake til oversikten
                </Text>
              }
              placement="bottom"
              portal
            >
              <Button
                icon={ChevronLeftIcon}
                mode="bleed"
                padding={2}
                onClick={handleBack}
              />
            </Tooltip>
            <TabBar />
          </Flex>

          <Flex
            align="center"
            gap={1}
          >
            <SiteCombobox isDirty={isDirty} />
            {/* ── Right zone: preview ── */}
            {previewUrl && (
              <Tooltip
                content={
                  <Text
                    size={1}
                  >
                    Åpne forhåndsvisning
                  </Text>
                }
                placement="bottom"
                portal
              >
                {/* Wrapper div needed because Tooltip requires a single child that accepts ref */}
                <div>
                  <Button
                    icon={previewHidden ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    mode="bleed"
                    padding={2}
                    onClick={togglePreviewHidden}
                  />
                </div>
              </Tooltip>
            )}
          </Flex>
        </Flex>
      </Card>

      {confirmBack && (
        <ConfirmDialog
          id="confirm-back"
          header="Forlat nettside?"
          message="Du har ulagrede endringer. Hvis du går tilbake til arbeidsområdet nå, vil disse endringene gå tapt."
          confirmLabel="Gå tilbake"
          cancelLabel="Avbryt"
          tone="critical"
          onConfirm={() => {
            setConfirmBack(false);
            clearSite();
            hidePreview();
          }}
          onCancel={() => setConfirmBack(false)}
        />
      )}
    </>
  );
}

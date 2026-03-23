import { Button, Card, Flex, Tooltip, Text } from "@sanity/ui";
import { ChevronLeftIcon, EyeClosedIcon, EyeOpenIcon } from "@sanity/icons";
import { useState } from "react";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { SiteCombobox } from "./SiteCombobox";
import { ConfirmDialog } from "./ConfirmDialog";

interface TopBarProps {
    isDirty?: boolean;
}

export function TopBar({ isDirty = false }: TopBarProps) {
    const { clearSite, previewUrl, togglePreviewHidden, previewHidden, hidePreview } =
        useToolLayout();
    const [confirmBack, setConfirmBack] = useState(false);

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
          padding={2}
        >
          <Flex
            align="center"
            justify="space-between"
            gap={2}
          >
            {/* ── Left zone: back + site switcher ── */}
            <Flex
              align="center"
              gap={1}
            >
              <Tooltip
                content={
                  <Text
                    size={1}
                    style={{ padding: "4px 8px" }}
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

              <SiteCombobox isDirty={isDirty} />
            </Flex>

            {/* ── Right zone: preview ── */}
            {previewUrl && (
              <Flex
                align="center"
                gap={1}
              >
                <Tooltip
                  content={
                    <Text
                      size={1}
                      style={{ padding: "4px 8px" }}
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
              </Flex>
            )}
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

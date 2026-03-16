import { Button, Card, Flex, Tooltip, Text } from "@sanity/ui";
import { ChevronLeftIcon } from "@sanity/icons";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { SiteCombobox } from "./SiteCombobox";
import { ConfirmDialog } from "./ConfirmDialog";

interface TopBarProps {
  isDirty?: boolean;
}

export function TopBar({ isDirty = false }: TopBarProps) {
  const { clearSite, previewUrl, selectSite } = useToolLayout();
  const [confirmBack, setConfirmBack] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      setConfirmBack(true);
    } else {
      clearSite();
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
                  Tilbake til arbeidsområdet
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
                  {previewUrl
                    ? "Åpne forhåndsvisning i ny fane"
                    : "Ingen forhåndsvisning tilgjengelig for dette dokumentet"}
                </Text>
              }
              placement="bottom"
              portal
            >
              {/* Wrapper div needed because Tooltip requires a single child that accepts ref */}
              <div>
                <Button
                  icon={<EyeIcon style={{ width: 16, height: 16 }} />}
                  mode="bleed"
                  padding={2}
                  disabled={!previewUrl}
                  onClick={() => {
                    if (previewUrl) window.open(previewUrl, "_blank");
                  }}
                />
              </div>
            </Tooltip>
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
          }}
          onCancel={() => setConfirmBack(false)}
        />
      )}

     
    </>
  );
}

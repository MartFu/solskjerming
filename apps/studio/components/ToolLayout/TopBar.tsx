import { Button, Card, Flex, Tooltip, Text } from "@sanity/ui";
import { ChevronLeftIcon, EyeClosedIcon, EyeOpenIcon } from "@sanity/icons";
import { useState } from "react";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { SiteCombobox } from "./SiteCombobox";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { TabBar } from "./TabBar";
import { useRouter } from "sanity/router";
import { Divider } from "../divider";

interface TopBarProps {
    currentTool: string;
    isDirty?: boolean;
}

export function TopBar({ currentTool, isDirty = false }: TopBarProps) {
    const { clearSite, workspace } = useToolLayout();
    const [confirmBack, setConfirmBack] = useState(false);
    const { navigateUrl } = useRouter();

    const handleBack = () => {
        if (isDirty) {
            setConfirmBack(true);
        } else {
            clearSite();
        }
    };

    const isPresentation = currentTool === "presentation";

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
                                <Text size={1}>Tilbake til oversikten</Text>
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
                        gap={3}
                    >
                        <SiteCombobox isDirty={isDirty} />

                        <Divider
                            thickness={1}
                            length={20}
                            opacity={0.4}
                        />

                        <Tooltip
                            content={
                                <Text size={1}>Åpne visuell redigering</Text>
                            }
                            placement="bottom"
                            portal
                        >
                            {/* Wrapper div needed because Tooltip requires a single child that accepts ref */}
                            <div>
                                <Button
                                    icon={
                                        isPresentation ? (
                                            <EyeClosedIcon />
                                        ) : (
                                            <EyeOpenIcon />
                                        )
                                    }
                                    mode="bleed"
                                    padding={2}
                                    onClick={() => {
                                        const path = isPresentation
                                            ? `/${workspace}/structure`
                                            : `/${workspace}/presentation`;

                                        navigateUrl({
                                            path,
                                            replace: true,
                                        });
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

import { useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import {
    Box,
    Button,
    Card,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    Popover,
    Spinner,
    Stack,
    Text,
    TextInput,
} from "@sanity/ui";
import { ChevronDownIcon, SearchIcon } from "@sanity/icons";
import { API_VERSION } from "@/utils/constant";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { ConfirmDialog } from "./ConfirmDialog";
import { ActiveSite, Site } from "@/utils/types";

interface SiteComboboxProps {
    /** Whether there is a dirty (unsaved) document open — triggers confirmation */
    isDirty?: boolean;
}

export function SiteCombobox({ isDirty = false }: SiteComboboxProps) {
    const { workspace, activeSite, selectSite } = useToolLayout();
    const client = useClient({ apiVersion: API_VERSION });

    const [search, setSearch] = useState("");
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingSite, setPendingSite] = useState<ActiveSite | null>(null);

    const fetchSites = () => {
        setLoading(true);
        client
            .fetch<Site[]>(
                `*[_type == "site" && workspace == $workspace && !(_id in path("drafts.**"))] | order(title asc) { _id, title, domain, "slug": slug.current, _updatedAt }`,
                { workspace },
            )
            .then((result) => {
                setSites(result);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const filtered = sites.filter(
        (s) =>
            s._id !== activeSite?._id &&
            s.title.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelect = (site: Site) => {
        const next: ActiveSite = { _id: site._id, title: site.title, domain: site.domain, slug: site.slug, _updatedAt: site._updatedAt };
        setSearch("");
        if (isDirty) {
            setPendingSite(next);
        } else {
            selectSite(next);
        }
    };

    const confirmSwitch = () => {
        if (!pendingSite) return;

        selectSite(pendingSite);
        setPendingSite(null);
    };

    return (
        <>
            <MenuButton
                id="site-selector-menu"
                // Use 'onOpen' to trigger the fetch instead of manual useEffect
                onOpen={fetchSites}
                button={
                    <Button
                        mode="bleed"
                        padding={2}
                        fontSize={1}
                        iconRight={<ChevronDownIcon />}
                        text={activeSite?.title || "Velg nettside"}
                    />
                }
                menu={
                    <Menu style={{ width: 220 }}>
                        <Box padding={1}>
                            <Text
                                weight={"medium"}
                                style={{ fontSize: "12px" }}
                            >
                                Velg Nettsted
                            </Text>
                        </Box>

                        <Card borderBottom />

                        {/* Search Input stays inside the Menu area */}
                        {filtered.length > 3 && (
                            <Box padding={1}>
                                <TextInput
                                    icon={SearchIcon}
                                    placeholder="Søk..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.currentTarget.value)
                                    }
                                    autoFocus
                                />
                            </Box>
                        )}

                        {loading ? (
                            <Flex
                                justify="center"
                                padding={2}
                            >
                                <Spinner />
                            </Flex>
                        ) : filtered.length === 0 ? (
                            <MenuItem
                                disabled
                                text="Ingen treff"
                            />
                        ) : (
                            filtered.map((site) => (
                                <MenuItem
                                    key={site._id}
                                    text={site.title}
                                    onClick={() => handleSelect(site)}
                                />
                            ))
                        )}
                    </Menu>
                }
                popover={{ portal: true, placement: "bottom-start" }}
            />

            {/* Confirmation dialog when switching with unsaved changes */}
            {pendingSite && (
                <ConfirmDialog
                    id="confirm-site-switch"
                    header="Bytt nettside?"
                    message={`Du har ulagrede endringer. Hvis du bytter til "${pendingSite.title}" nå, vil disse endringene gå tapt.`}
                    confirmLabel="Bytt likevel"
                    cancelLabel="Avbryt"
                    tone="critical"
                    onConfirm={confirmSwitch}
                    onCancel={() => setPendingSite(null)}
                />
            )}
        </>
    );
}

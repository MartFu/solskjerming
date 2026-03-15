import { useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import {
  Box,
  Button,
  Card,
  Flex,
  Popover,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import {  SearchIcon } from "@sanity/icons";
import { API_VERSION } from "@/utils/constant";
import {
  type ActiveSite,
  useToolLayout,
} from "@/context/ToolLayoutProvider";
import { ConfirmDialog } from "./ConfirmDialog";
import { ChevronsUpDown } from "lucide-react";

interface Site {
  _id: string;
  title: string;
  id: string;
}

interface SiteComboboxProps {
  /** Whether there is a dirty (unsaved) document open — triggers confirmation */
  isDirty?: boolean;
}

export function SiteCombobox({ isDirty = false }: SiteComboboxProps) {
  const { workspace, activeSite, selectSite } = useToolLayout();
  const client = useClient({ apiVersion: API_VERSION });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingSite, setPendingSite] = useState<ActiveSite | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch sites when popover opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    client
      .fetch<Site[]>(
        `*[_type == "site" && workspace == $workspace && !(_id in path("drafts.**"))]
         | order(title asc) { _id, title, id }`,
        { workspace },
      )
      .then((result) => {
        setSites(result);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      })
      .catch(() => setLoading(false));
  }, [open, workspace, client]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = sites.filter(
    (s) =>
      s._id !== activeSite?._id &&
      s.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (site: Site) => {
    const next: ActiveSite = { _id: site._id, title: site.title };
    setOpen(false);
    setSearch("");
    if (isDirty) {
      setPendingSite(next);
    } else {
      selectSite(next);
    }
  };

  const confirmSwitch = () => {
    if (pendingSite) selectSite(pendingSite);
    setPendingSite(null);
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{ position: "relative" }}
      >
        <Popover
          open={open}
          placement="bottom-start"
          portal
          content={
            <Box
              style={{ width: 220 }}
              padding={2}
            >
              <Stack space={1}>
                {filtered?.length > 3 && (
                  <Box padding={1}>
                    <TextInput
                      ref={inputRef}
                      icon={SearchIcon}
                      placeholder="Søk i nettsider…"
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                      fontSize={1}
                    />
                  </Box>
                )}

                {loading ? (
                  <Flex
                    justify="center"
                    padding={3}
                  >
                    <Spinner muted />
                  </Flex>
                ) : filtered.length === 0 ? (
                  <Box padding={3}>
                    <Text
                      size={1}
                      muted
                    >
                      {search
                        ? `Ingen treff på "${search}"`
                        : "Ingen andre nettsider."}
                    </Text>
                  </Box>
                ) : (
                  <Stack>
                    {filtered.map((site) => (
                      <Button
                        key={site._id}
                        as="button"
                        padding={3}
                        radius={2}
                        tone="neutral"
                        mode="bleed"
                        onClick={() => handleSelect(site)}
                        style={{
                          cursor: "pointer",
                          border: "none",
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        <Text size={1}>{site.title}</Text>
                      </Button>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>
          }
        >
          {/* Trigger */}
          <Button
            as="button"
            padding={2}
            radius={2}
            tone="neutral"
            mode="bleed"
            selected={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Flex
              align="center"
              gap={2}
            >
              <Text
                weight="semibold"
                size={1}
              >
                {activeSite?.title}
              </Text>
              <ChevronsUpDown
                style={{
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                }}
              />
            </Flex>
          </Button>
        </Popover>
      </div>

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

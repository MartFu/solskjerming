import React from "react";
import {
  Box,
  Button,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  Text,
} from "@sanity/ui";
import { CloseIcon } from "@sanity/icons";
import { useEditState, useDocumentOperation } from "sanity";
import { DocumentForm } from "./DocumentForm";
import { ReferencesPanel } from "./ReferencesPanel";
import type { Site } from "../types";

interface ProductDetailPaneProps {
  productId: string;
  onClose: () => void;
  onDeleted: () => void;
  sites: Site[];
}

export function ProductDetailPane({
  productId,
  onClose,
  onDeleted,
  sites,
}: ProductDetailPaneProps) {
  const [activeTab, setActiveTab] = React.useState<"edit" | "references">(
    "edit",
  );
  const editState = useEditState(productId, "product");
  const { delete: deleteOp } = useDocumentOperation(productId, "product");

  // Prefer the draft if it exists, fall back to the published version.
  const displayed = editState.draft ?? editState.published;

  if (!editState.ready) {
    return (
      <Flex
        flex={1}
        align="center"
        justify="center"
      >
        <Spinner muted />
      </Flex>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    deleteOp.execute();
    onDeleted();
  };

  return (
    <Flex
      direction="column"
      flex={1}
      style={{
        borderLeft: "1px solid var(--card-border-color)",
        overflow: "hidden",
        height: "100%",
        width: 240,
        minWidth: 200,
        maxWidth: 300,
      }}
    >
      {/* Pane header */}
      <Flex
        align="center"
        gap={2}
        padding={3}
        style={{
          borderBottom: "1px solid var(--card-border-color)",
          flexShrink: 0,
        }}
      >
        <Box flex={1}>
          <Text
            size={2}
            weight="semibold"
          >
            {String(displayed?.name ?? "Product")}
          </Text>
        </Box>
        <Button
          icon={CloseIcon}
          mode="ghost"
          padding={2}
          onClick={onClose}
        />
      </Flex>

      {/* Tabs */}
      <Box
        padding={3}
        style={{
          borderBottom: "1px solid var(--card-border-color)",
          flexShrink: 0,
        }}
      >
        <TabList space={2}>
          <Tab
            id="tab-edit"
            label="Edit"
            aria-controls="tabpanel-edit"
            selected={activeTab === "edit"}
            onClick={() => setActiveTab("edit")}
          />
          <Tab
            id="tab-references"
            label="References"
            aria-controls="tabpanel-references"
            selected={activeTab === "references"}
            onClick={() => setActiveTab("references")}
          />
        </TabList>
      </Box>

      {/* Tab panels */}
      <Box
        flex={1}
        overflow="auto"
      >
        <TabPanel
          id="tabpanel-edit"
          aria-labelledby="tab-edit"
          hidden={activeTab !== "edit"}
          style={{ height: "100%" }}
        >
          <Box padding={4}>
            <DocumentForm
              documentId={productId}
              documentType="product"
            />
          </Box>
        </TabPanel>

        <TabPanel
          id="tabpanel-references"
          aria-labelledby="tab-references"
          hidden={activeTab !== "references"}
        >
          <Box padding={4}>
            <ReferencesPanel
              productId={productId}
              productName={String(displayed?.name ?? "")}
              sites={sites}
              onRequestDelete={handleDelete}
            />
          </Box>
        </TabPanel>
      </Box>
    </Flex>
  );
}

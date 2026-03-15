import React from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@sanity/ui";
import {
  AddIcon,
  EllipsisVerticalIcon,
  EditIcon,
  TrashIcon,
  LinkIcon,
  CopyIcon,
} from "@sanity/icons";
import type { ProductListItem } from "../types";

const STATUS_TONE: Record<string, "positive" | "caution" | "default"> = {
  active: "positive",
  draft: "caution",
  archived: "default",
};

const PRICING_LABEL: Record<string, string> = {
  fixed: "Fixed",
  configured: "Configured",
};

interface ProductListProps {
  products: ProductListItem[];
  loading: boolean;
  selectedProductId: string | null;
  onSelect: (id: string) => void;
  onCreateProduct: () => void;
  onDeleteProduct: (id: string) => void;
  onDuplicateProduct: (id: string) => void;
}

function ProductCard({
  product,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  product: ProductListItem;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <Card
      tone={selected ? "primary" : "default"}
      selected={selected}
      radius={2}
      shadow={selected ? 1 : 0}
      style={{
        cursor: "pointer",
        border: "1px solid var(--card-border-color)",
        transition: "box-shadow 120ms",
      }}
      onClick={onSelect}
    >
      <Stack space={0}>
        {/* Header row */}
        <Flex
          align="center"
          gap={2}
          padding={3}
          style={{ borderBottom: "1px solid var(--card-border-color)" }}
        >
          <Box
            flex={1}
            style={{ minWidth: 0 }}
          >
            <Text
              size={2}
              weight="semibold"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 2.4
              }}
            >
              {product.name}
            </Text>
          </Box>

          <Badge
            tone={STATUS_TONE[product.status] ?? "default"}
            size={0}
            style={{ flexShrink: 0 }}
          >
            {product.status}
          </Badge>

          {/* Context menu */}
          <MenuButton
            button={
              <Button
                icon={EllipsisVerticalIcon}
                mode="ghost"
                paddingY={[2]}
                paddingX={[2]}
                fontSize={1}
                onClick={(e) => e.stopPropagation()}
              />
            }
            id={`product-menu-${product._id}`}
            menu={
              <Menu>
                <MenuItem
                  icon={EditIcon}
                  text="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                />
                <MenuItem
                  icon={CopyIcon}
                  text="Duplicate"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                />
                <MenuItem
                  icon={TrashIcon}
                  text="Delete"
                  tone="critical"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                />
              </Menu>
            }
            popover={{ placement: "bottom-end" }}
          />
        </Flex>

        {/* Stats row */}
        <Flex
          align="center"
          gap={3}
          padding={3}
        >
          <Flex
            align="center"
            gap={1}
          >
            <Text
              size={0}
              muted
            >
              Pricing:
            </Text>
            <Text size={0}>
              {PRICING_LABEL[product.pricingType] ?? product.pricingType}
            </Text>
          </Flex>

          {product.pricingType === "fixed" && product.basePrice != null && (
            <Flex
              align="center"
              gap={1}
            >
              <Text
                size={0}
                muted
              >
                Base:
              </Text>
              <Text size={0}>
                {product.basePrice.toLocaleString("nb-NO", {
                  style: "currency",
                  currency: "NOK",
                  maximumFractionDigits: 0,
                })}
              </Text>
            </Flex>
          )}

          <Flex
            align="center"
            gap={1}
          >
            <Text
              size={0}
              muted
            >
              Options:
            </Text>
            <Text size={0}>{product.optionCount}</Text>
          </Flex>
        </Flex>
      </Stack>
    </Card>
  );
}

export function ProductList({
  products,
  loading,
  selectedProductId,
  onSelect,
  onCreateProduct,
  onDeleteProduct,
  onDuplicateProduct,
}: ProductListProps) {
  if (loading) {
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

  return (
    <Flex
      direction="column"
      flex={1}
      style={{ overflow: "hidden", height: "100%" }}
    >
      {/* Toolbar */}
      <Flex
        align="center"
        justify="space-between"
        padding={3}
        style={{
          borderBottom: "1px solid var(--card-border-color)",
          flexShrink: 0,
        }}
      >
        <Text
          size={1}
          muted
        >
          {products.length} product{products.length !== 1 ? "s" : ""}
        </Text>
        <Button
          icon={AddIcon}
          text="New product"
          tone="primary"
          fontSize={1}
          padding={2}
          onClick={onCreateProduct}
        />
      </Flex>

      {/* Product cards */}
      <Box
        flex={1}
        overflow="auto"
        padding={3}
      >
        {products.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%" }}
          >
            <Stack
              space={3}
              style={{ textAlign: "center" }}
            >
              <Text muted>No products here yet.</Text>
              <Button
                icon={AddIcon}
                text="Create first product"
                mode="ghost"
                onClick={onCreateProduct}
              />
            </Stack>
          </Flex>
        ) : (
          <Grid
            columns={[1, 1, 2]}
            gap={3}
          >
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                selected={selectedProductId === p._id}
                onSelect={() => {
                  selectedProductId === p._id ? onSelect("") : onSelect(p._id);
                }}
                onDelete={() => onDeleteProduct(p._id)}
                onDuplicate={() => onDuplicateProduct(p._id)}
              />
            ))}
          </Grid>
        )}
      </Box>
    </Flex>
  );
}

/**
 * DocumentForm
 *
 * Renders the native Sanity Studio form for a given document ID + type,
 * without opening a full document pane. This gives us the full field/group
 * editing experience (including conditional fields, array editors, etc.)
 * inline inside our custom Products view.
 *
 * Implementation note:
 * Sanity 3+ exposes a `<DocumentPane>` component via sanity/structure, but
 * embedding it cleanly inside a custom tool requires some plumbing. The
 * recommended approach for Sanity 3.x / 4.x is to use the `useDocumentForm`
 * hook (internal) or redirect to an intent.
 *
 * For maximum compatibility and stability we open the document in Sanity's
 * native document pane via the `useIntentLink` pattern — this avoids
 * internal API surface that may change between patch releases.
 *
 * If you prefer a fully embedded form (no URL change), replace the body of
 * this component with the `PatchForm` approach using `useDocumentStore` and
 * `<FormBuilder>` — see Sanity's plugin authoring docs for v3.
 */
import React from "react";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { EditIcon } from "@sanity/icons";
import { useIntentLink } from "sanity/router";
import { ExternalLink } from "lucide-react";

interface DocumentFormProps {
  documentId: string;
  documentType: string;
}

export function DocumentForm({ documentId, documentType }: DocumentFormProps) {
  const { onClick, href } = useIntentLink({
    intent: "edit",
    params: { id: documentId, type: documentType },
  });

  return (
    <Card
      padding={4}
      radius={2}
      tone="transparent"
      style={{ border: "1px dashed var(--card-border-color)" }}
    >
      <Flex
        direction="column"
        align="center"
        gap={4}
        style={{ textAlign: "center" }}
      >
        <EditIcon style={{ fontSize: 32, opacity: 0.3 }} />
        <Stack space={2}>
          <Text
            size={1}
            weight="semibold"
          >
            Open full editor
          </Text>
          <Text
            size={1}
            muted
          >
            The product form opens in Sanity's native document pane, giving you
            the full editing experience including conditional fields, pricing
            tables, and option groups.
          </Text>
        </Stack>
        <Button
          as="a"
          href={href}
          icon={ExternalLink}
          text="Edit in document pane"
          tone="primary"
          onClick={onClick}
        />
      </Flex>
    </Card>
  );
}




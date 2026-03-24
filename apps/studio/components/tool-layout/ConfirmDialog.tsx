import { Box, Button, Card, Dialog, Flex, Grid, Stack, Text } from "@sanity/ui";
import { WarningOutlineIcon } from "@sanity/icons";

interface ConfirmDialogProps {
  id: string;
  header: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "critical" | "caution" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  id,
  header,
  message,
  confirmLabel = "Fortsett",
  cancelLabel = "Avbryt",
  tone = "critical",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      header={header}
      id={id}
      onClose={onCancel}
      zOffset={2000}
      width={1}
    >
      <Box padding={4}>
        <Stack space={5}>
          <Card
            tone="caution"
            padding={3}
            radius={2}
            border
          >
            <Flex
              align="flex-start"
              gap={3}
            >
              <WarningOutlineIcon style={{ marginTop: 2, flexShrink: 0 }} />
              <Text size={2}>{message}</Text>
            </Flex>
          </Card>

          <Grid
            columns={2}
            gap={2}
          >
            <Button
              text={cancelLabel}
              mode="ghost"
              onClick={onCancel}
            />
            <Button
              text={confirmLabel}
              tone={tone}
              onClick={onConfirm}
            />
          </Grid>
        </Stack>
      </Box>
    </Dialog>
  );
}

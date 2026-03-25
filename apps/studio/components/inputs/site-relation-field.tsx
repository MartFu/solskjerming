import { useSiteContext } from "@/context/SiteProvider";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { asStudioIcon } from "@/utils/helper";
import { getActiveSite } from "@/utils/persistence/context";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { Link, Zap } from "lucide-react";
import {
    DocumentFieldAction,
    DocumentFieldActionHook,
    FieldActionMenuProps,
    FieldProps,
    FormNodeValidation,
    InputProps,
    ReferenceInput,
    ReferenceInputProps,
    set,
    StringInputProps,
} from "sanity";

export function SiteRelationField(props: FieldProps) {
    const { renderDefault, validation } = props;
    const hasError = validation.some((v: any) => v.level === "error");

    return (
        <Box>
            {renderDefault({ ...props })}
            {hasError && (
                <Box
                    padding={3}
                    marginTop={2}
                    style={{ background: "#fee2e2", borderRadius: "4px" }}
                >
                    <Text
                        size={1}
                        weight="bold"
                        key="err"
                    >
                        Tilkobling mangler!
                    </Text>
                    <Button
                        fontSize={1}
                        padding={2}
                        text="Koble til aktivt nettsted nå"
                        onClick={() => {
                            // Here is your "Predefined Action"
                            // e.g., using document patch to set the ID
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}

export function SiteRelationFieldInput({
    validation,
    onChange,
    ...props
}: ReferenceInputProps) {
   console.log("SiteRelationFieldMounting is mounting!");
    const siteId = "";
    const hasError = validation.some((v: FormNodeValidation) => v.level === "error");
    const canFix = hasError && siteId;

    return (
        <Stack space={1}>
            <Flex gap={1}>
                <Box flex={1}>
                    <ReferenceInput
                        {...props}
                        onChange={onChange}
                        validation={validation}
                        readOnly
                    />
                </Box>

                {canFix && (
                    <Button
                        fontSize={1}
                        padding={2}
                        paddingX={4}
                        tone="primary"
                        text="Koble til"
                        icon={asStudioIcon(Link)}
                        onClick={() => {
                            onChange(
                                set({ _type: "reference", _ref: siteId }, [
                                    "site",
                                ]),
                            );
                        }}
                    />
                )}
            </Flex>
            {!canFix && (
                <Card padding={3} tone="critical">
                    <Text
                        size={1}
                        weight="bold"
                        key="err"
                    >
                        [FEIL] Kan ikke repareres via grensesnittet.

                    </Text>
                </Card>
            )}
        </Stack>
    );
}

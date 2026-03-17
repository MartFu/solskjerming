import { Badge, Flex } from "@sanity/ui";

export const InheritedLabel = () => {
    return (
        <Flex
            align="center"
            justify={"flex-end"}
            gap={2}
        >
            <Badge
                tone="caution"
                fontSize={1}
            >
                Arvet
            </Badge>
        </Flex>
    );
};

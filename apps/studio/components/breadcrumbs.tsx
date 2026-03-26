import { Breadcrumb } from "@/utils/site/buildSiteDocumentTree";
import { Box, Button, Flex, Text } from "@sanity/ui";

export function Breadcrumbs({
    crumbs,
    onNavigate,
}: {
    crumbs: Breadcrumb[];
    onNavigate: (id: string) => void;
}) {
    return (
        <Flex
            align="center"
            gap={2}
            wrap="wrap"
        >
            {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                    <Flex
                        key={crumb._id}
                        align="center"
                        gap={2}
                    >
                        {i > 0 && <Text size={1}>/</Text>}
                        {isLast ? (
                            <Box padding={1}>
                                <Text size={1}>{crumb.title}</Text>
                            </Box>
                        ) : (
                            <Button
                                onClick={() => onNavigate(crumb._id)}
                                tone="neutral"
                                mode="bleed"
                                padding={1}
                                fontSize={1}
                            >
                                {crumb.title}
                            </Button>
                        )}
                    </Flex>
                );
            })}
        </Flex>
    );
}

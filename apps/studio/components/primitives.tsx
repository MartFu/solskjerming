import { useArchiveSite } from "@/context/ArchiveSiteProvider";
import { asStudioIcon } from "@/utils/helper";
import { ArrowLeftIcon } from "@sanity/icons";
import {
    Badge,
    Button,
    ButtonProps,
    Flex,
    Label,
    LabelProps,
    Text,
    TextProps,
} from "@sanity/ui";
import { ArrowUpRight } from "lucide-react";

export const StudioArrowUpRight = asStudioIcon(ArrowUpRight);

export function TextMono({
    children,
    ...props
}: TextProps & { children?: React.ReactNode }) {
    return (
        <Text
            style={{
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.02em",
            }}
            {...props}
        >
            {children}
        </Text>
    );
}

export function DraftBadge() {
    return (
        <Badge
            tone="caution"
            fontSize={0}
            style={{ transition: "ease-in-out 0.4s" }}
        >
            kladd
        </Badge>
    );
}

export function SectionLabel({
    children,
    ...props
}: LabelProps & {
    children?: React.ReactNode;
}) {
    return (
        <Label
            size={1}
            {...props}
        >
            {children}
        </Label>
    );
}

export function BackButton(props: ButtonProps & { onClick: () => void }) {
    return (
        <Button
            {...props}
            onClick={props.onClick}
            padding={1}
            mode="bleed"
            tone="neutral"
        >
            <Flex
                gap={1}
                align="center"
                justify="center"
            >
                <ArrowLeftIcon />
            </Flex>
        </Button>
    );
}


export function StudioLink({ onClick, href, rel, target }: { onClick?: () => void; href?: string; rel?: string; target?: string }) {
  return (
      <Button
          as={"a"}
          href={href}
          target={target}
          rel={rel}
          onClick={onClick}
          style={{
              cursor: "pointer",
          }}
          tone="primary"
          mode="ghost"
          paddingY={1}
          paddingX={2}
      >
          <Flex
              gap={1}
              align="center"
          >
              <Text size={0}>Åpne i Studio</Text>
              <StudioArrowUpRight />
          </Flex>
      </Button>
  );
}
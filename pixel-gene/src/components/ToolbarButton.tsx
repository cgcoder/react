import { Button, ButtonProps } from "@mantine/core";

export interface ToolbarButtonProps extends ButtonProps {
    selected: boolean;
}

export default function ToolbarButton(props: ToolbarButtonProps) {
    return (<Button radius={0} px={10} py={5} variant={props.selected ? "filled" : "transparent"} {...props}>{props.children}</Button>);
}
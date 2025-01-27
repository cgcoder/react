import { Button, ButtonProps } from "@mantine/core";

export interface ToolbarButtonProps extends ButtonProps {
    selected: boolean;
}

export default function ToolbarButton(props: ToolbarButtonProps) {
    return (<Button radius={0} px={10} py={0} variant={props.selected ? "filled" : "default"} {...props}>{props.children}</Button>);
}
import { MenuBar } from "./MenuBar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return <>
        <MenuBar></MenuBar>

        <Outlet />
    </>;
}
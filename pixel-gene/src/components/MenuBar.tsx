import { Group, Button, Menu, Text, rem } from '@mantine/core';
import {
    IconSettings,
    IconSearch,
    IconPhoto,
    IconMessageCircle,
    IconTrash,
    IconArrowsLeftRight,
    IconNews,
    IconFile,
    IconDeviceFloppy,
    IconCopy,
} from '@tabler/icons-react';

export const MenuBar = () => {
    return (
        <Group justify="left" gap={1}>
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Button variant="subtle">File</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item leftSection={<IconFile style={{ width: rem(14), height: rem(14) }} />}>
                        New
                    </Menu.Item>
                    <Menu.Item leftSection={<IconDeviceFloppy style={{ width: rem(14), height: rem(14) }} />}>
                        Save
                    </Menu.Item>
                    <Menu.Item leftSection={<IconCopy style={{ width: rem(14), height: rem(14) }} />}>
                        Save As ...
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}
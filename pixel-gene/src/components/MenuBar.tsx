import { Group, Button, Menu, rem } from '@mantine/core';
import {
    IconFile,
    IconDeviceFloppy,
    IconCopy,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const MENU_HEIGHT = 40;

export const MenuBar = () => {
    const navigate = useNavigate();

    const newAction = () => {
        navigate('/editor/new');
    }

    return (
        <div style={{ margin: '0px', padding: '0px', height: `${MENU_HEIGHT}px` }}>
            <Group justify="left" gap={1}>
                <Menu shadow="md" width={200}>
                    <Menu.Target>
                        <Button variant="subtle">File</Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconFile style={{ width: rem(14), height: rem(14) }} />} onClick={newAction}>
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
        </div>
    );
}
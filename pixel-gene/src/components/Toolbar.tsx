import { Flex } from '@mantine/core';
import ToolbarButton from './ToolbarButton';
import { IconCircle, IconDeviceVisionPro, IconPencil, IconSquare } from '@tabler/icons-react';
import { useEditorState } from '../model/useEditorState';
import { LineTool } from '../model/tool';

export default function Toolbar() {

    const state = useEditorState();

    const line = () => {
        state.setCurrentTool(LineTool);
        LineTool.start(state);
        state.startBuffer();
    }

    return (
        <Flex
            mih={50}
            gap="2"
            justify="flex-start"
            align="flex-start"
            direction="column"
            wrap="wrap"
        >
            <ToolbarButton selected={true}><IconPencil size={20} /></ToolbarButton>
            <ToolbarButton selected={false} onClick={line}><IconDeviceVisionPro size={20} /></ToolbarButton>
            <ToolbarButton selected={false}><IconSquare size={20} /></ToolbarButton>
            <ToolbarButton selected={false}><IconCircle size={20} /></ToolbarButton>
        </Flex>
    );
}
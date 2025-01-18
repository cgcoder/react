import './App.css'
import '@mantine/core/styles.css';
import { MenuBar } from './components/MenuBar';

import { MantineProvider } from '@mantine/core';
import { EditorCanvas } from './components/EditorCanvas';

function App() {

  return (
    <MantineProvider>
      <MenuBar></MenuBar>
      <EditorCanvas></EditorCanvas>
    </MantineProvider>
  )
}

export default App

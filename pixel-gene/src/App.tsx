import './App.css'
import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import Router from './components/Router';
// import { EditorCanvas } from './components/EditorCanvas';


function App() {

  return (
    <MantineProvider>
      <Router />
    </MantineProvider>
  )
}

export default App

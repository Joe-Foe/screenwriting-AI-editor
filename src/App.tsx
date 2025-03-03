import { useState } from 'react';
import EditorTest from './components/EditorTest'
import FormatToolbar from './components/FormatToolbar'
import { useEditorFormat } from './hooks/useEditorFormat'

function App() {
  const formatState = useEditorFormat();
  const [formatFunctions, setFormatFunctions] = useState({});
  
  return (
    <div>
      <h1>Screenplay Editor Test</h1>
      <FormatToolbar 
        {...formatState} 
        formatFunctions={formatFunctions} 
      />
      <EditorTest 
        {...formatState} 
        setFormatFunctions={setFormatFunctions} 
      />
    </div>
  )
}

export default App

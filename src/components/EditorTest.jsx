import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import styled from 'styled-components'
import { useCallback, useEffect, useRef, useState } from 'react'

// Fixed styled component that properly filters out the isActive prop
const MenuButton = styled.button.attrs(props => ({
  // Extract any custom props that shouldn't be passed to the DOM
  className: props.isActive ? 'is-active' : '',
  // Only keep safe props
  type: props.type || 'button',
}))`
  margin-right: 5px;
  padding: 5px 10px;
  background: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #e1e1e1;
  }
  
  &.is-active {
    background: #e0e0e0;
    font-weight: bold;
  }
`

const EditorContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  margin: 20px 0;
  
  .ProseMirror {
    min-height: 150px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`

const MenuBar = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
  display: flex;
  gap: 5px;
`

// Debug overlay
const DebugPanel = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  background: black;
  color: lime;
  padding: 10px;
  font-family: monospace;
  max-height: 200px;
  overflow: auto;
  width: 300px;
  z-index: 9999;
`

// Clickable test area
const TestClickArea = styled.div`
  padding: 20px;
  background: yellow;
  margin: 10px 0;
  text-align: center;
  cursor: pointer;
`

const EditorTest = () => {
  const containerRef = useRef(null);
  const editorContentRef = useRef(null);
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-20));
  };

  // Initialize editor with detailed logging
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Hello World! Click here to edit...</p>',
    autofocus: 'end',
    editable: true,
    onBeforeCreate: ({ editor }) => {
      addLog('Editor before create');
    },
    onCreate: ({ editor }) => {
      addLog('Editor created');
    },
    onUpdate: ({ editor }) => {
      addLog('Editor updated');
    },
    onSelectionUpdate: ({ editor }) => {
      addLog('Selection updated');
    },
    onFocus: ({ editor, event }) => {
      addLog('Editor focused');
    },
    onBlur: ({ editor, event }) => {
      addLog('Editor blurred');
    },
  });

  // Check DOM and editor status
  useEffect(() => {
    if (editor) {
      addLog(`Editor initialized: editable=${editor.isEditable}`);
      
      // Force editor to be editable
      editor.setEditable(true);
      addLog(`Editor forced editable=${editor.isEditable}`);
      
      // Check container
      if (containerRef.current) {
        addLog(`Container found in DOM`);
        
        // Add direct event listener to container
        const container = containerRef.current;
        const handleContainerClick = () => {
          addLog('Container clicked directly');
          editor.commands.focus();
        };
        
        container.addEventListener('click', handleContainerClick);
        return () => container.removeEventListener('click', handleContainerClick);
      } else {
        addLog('Container NOT found in DOM');
      }
    }
  }, [editor]);
  
  // Test click handler
  const handleTestClick = () => {
    addLog('Test area clicked');
    if (editor) {
      editor.commands.focus('end');
      addLog('Focus command sent to editor');
    }
  };
  
  // Direct DOM check
  useEffect(() => {
    const timer = setTimeout(() => {
      const proseMirror = document.querySelector('.ProseMirror');
      addLog(`ProseMirror element found: ${Boolean(proseMirror)}`);
      
      if (proseMirror) {
        const styles = window.getComputedStyle(proseMirror);
        addLog(`Z-index: ${styles.zIndex}, Position: ${styles.position}`);
        addLog(`Pointer events: ${styles.pointerEvents}`);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = useCallback((event) => {
    addLog(`Key pressed: ${event.key}`);
  }, []);
  
  const handleClick = useCallback((event) => {
    addLog(`Editor content clicked at ${event.clientX},${event.clientY}`);
  }, []);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <>
      <EditorContainer ref={containerRef}>
        <MenuBar>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            Bold
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            Italic
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
          >
            Paragraph
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          >
            H1
          </MenuButton>
        </MenuBar>
        
        <TestClickArea onClick={handleTestClick}>
          Click this yellow area to test if clicks work
        </TestClickArea>
        
        <div onClick={handleClick} ref={editorContentRef}>
          <EditorContent 
            editor={editor} 
            onKeyDown={handleKeyDown}
          />
        </div>
      </EditorContainer>
      
      <button onClick={() => {
        addLog('Manual focus button clicked');
        editor.commands.focus('end');
      }}>
        Focus Editor Manually
      </button>
      
      <button onClick={() => {
        addLog('Insert text button clicked');
        editor.commands.insertContent('Text inserted programmatically!');
      }}>
        Insert Text Programmatically
      </button>
      
      <DebugPanel>
        <strong>Debug Logs:</strong>
        <pre style={{ margin: 0 }}>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </pre>
      </DebugPanel>
    </>
  );
};

export default EditorTest; 
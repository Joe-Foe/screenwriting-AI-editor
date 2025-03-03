import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './SimpleEditor.css'

const SimpleEditor = () => {
  // Initialize the editor with just StarterKit for basic functionality
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '<p></p>',
    autofocus: true,
  })

  if (!editor) {
    return null
  }

  // Handle screenplay formatting
  const formatAs = (type) => {
    editor.chain().focus();
    
    // Apply different formatting based on screenplay element type
    switch(type) {
      case 'scene-heading':
        // Scene headings are typically uppercase
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case 'action':
        editor.chain().focus().setParagraph().run();
        break;
      case 'character':
        // Characters are typically uppercase and centered
        editor.chain().focus().setHeading({ level: 4 }).run();
        break;
      case 'dialogue':
        editor.chain().focus().setParagraph().run();
        break;
      case 'parenthetical':
        // Parentheticals are typically in italics
        editor.chain().focus().setHeading({ level: 5 }).run();
        break;
      default:
        editor.chain().focus().setParagraph().run();
    }
  }

  return (
    <div className="document-container">
      <div className="toolbar">
        <button 
          onClick={() => formatAs('scene-heading')}
          className="screenplay-button"
        >
          Scene Heading
        </button>
        <button 
          onClick={() => formatAs('action')}
          className="screenplay-button"
        >
          Action
        </button>
        <button 
          onClick={() => formatAs('character')}
          className="screenplay-button"
        >
          Character
        </button>
        <button 
          onClick={() => formatAs('dialogue')}
          className="screenplay-button"
        >
          Dialogue
        </button>
        <button 
          onClick={() => formatAs('parenthetical')}
          className="screenplay-button"
        >
          Parenthetical
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="screenplay-button test-button"
        >
          TEST CHARACTER
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="screenplay-button retard-button"
        >
          RETARD CLAUDE
        </button>
      </div>
      <div className="document-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default SimpleEditor 
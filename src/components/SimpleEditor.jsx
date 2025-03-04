import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import './SimpleEditor.css'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

// This suggestion implementation is from the TipTap official docs
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

// Updated MentionList with keyboard navigation
const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const selectItem = (index) => {
    const item = props.items[index]
    if (item) {
      props.command({ id: item })
    }
  }

  // Navigation handlers
  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  // Reset selection when items change
  useEffect(() => setSelectedIndex(0), [props.items])

  // Define what happens on keyboard events
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="items">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  )
})

const SimpleEditor = () => {
  // Start with an empty array - no defaults
  const [characters, setCharacters] = useState([])
  
  // Track if localStorage has been loaded
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Load characters from localStorage on mount
  useEffect(() => {
    // Check if localStorage has characters
    const stored = localStorage.getItem('screenplay-characters')
    console.log('Checking localStorage:', stored)
    
    if (stored) {
      try {
        const parsedCharacters = JSON.parse(stored)
        console.log('Found characters in localStorage:', parsedCharacters)
        setCharacters(parsedCharacters)
      } catch (error) {
        console.error('Error parsing localStorage characters:', error)
      }
    } else {
      console.log('No characters found in localStorage')
    }
    
    // Mark data as loaded
    setDataLoaded(true)
  }, [])

  // Add debugging to check characters changes
  useEffect(() => {
    console.log('Characters state updated:', characters)
  }, [characters])

  // This is the exact suggestion configuration from TipTap docs
  // Only create the editor after data is loaded
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion: {
            items: ({ query }) => {
              console.log('Mention query:', query)
              console.log('Characters available:', characters)
              
              if (characters.length === 0) {
                console.log('No characters available for mention')
                return []
              }
              
              const filtered = characters
                .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
              
              console.log('Filtered characters:', filtered)
              return filtered
            },
            
            render: () => {
              let component
              let popup
              
              return {
                onStart: props => {
                  component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                  })
                  
                  popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                  })
                },
                
                onUpdate(props) {
                  component.updateProps(props)
                  
                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                  })
                },
                
                onKeyDown(props) {
                  if (props.event.key === 'Escape') {
                    popup[0].hide()
                    return true
                  }
                  
                  return component.ref?.onKeyDown(props)
                },
                
                onExit() {
                  popup[0].destroy()
                  component.destroy()
                },
              }
            },
          },
        }),
      ],
      content: '<p></p>',
      onUpdate: ({ editor }) => {
        console.log("Editor content updated")
      },
      autofocus: true,
    },
    [dataLoaded]
  )

  useEffect(() => {
    if (editor) {
      console.log("Editor initialized")
    }
  }, [editor])

  // Handle screenplay formatting
  const formatAs = (type) => {
    if (!editor) return;
    
    switch(type) {
      case 'scene-heading':
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case 'action':
        editor.chain().focus().setParagraph().run();
        break;
      case 'character':
        editor.chain().focus().setHeading({ level: 4 }).run();
        break;
      case 'dialogue':
        editor.chain().focus().setParagraph().run();
        break;
      case 'parenthetical':
        editor.chain().focus().setHeading({ level: 5 }).run();
        break;
      default:
        editor.chain().focus().setParagraph().run();
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="document-container">
      <div className="toolbar">
        <button onClick={() => formatAs('scene-heading')} className="screenplay-button">
          Scene Heading
        </button>
        <button onClick={() => formatAs('action')} className="screenplay-button">
          Action
        </button>
        <button onClick={() => formatAs('character')} className="screenplay-button">
          Character
        </button>
        <button onClick={() => formatAs('dialogue')} className="screenplay-button">
          Dialogue
        </button>
        <button onClick={() => formatAs('parenthetical')} className="screenplay-button">
          Parenthetical
        </button>
      </div>
      <div className="document-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default SimpleEditor 
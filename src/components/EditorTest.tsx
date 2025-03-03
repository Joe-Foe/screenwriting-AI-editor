import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { useEditorFormat } from '../hooks/useEditorFormat'
import styled from 'styled-components'
import { useRef, useState, useEffect } from 'react'
import TestCharacterStore from './TestCharacterStore'
import { useCharacterStore } from '../hooks/useCharacterStore'

// Focus on fixing the height issue
const StyledEditorContent = styled(EditorContent)`
  min-height: 70vh;
  width: 100%;
  
  /* Critical fix: ensure ProseMirror takes full height and is clickable throughout */
  .ProseMirror {
    padding: 1rem;
    outline: none;
    background-color: white;
    min-height: 65vh; /* Explicit height for editable area */
    height: 100%;    /* Fill container */

    /* Screenplay format-specific styles */
    .format-scene-heading {
      text-transform: uppercase;
      text-align: left;
    }
    
    .format-action {
      text-align: left;
    }
    
    .format-character {
      text-transform: uppercase;
      text-align: center;
    }
    
    .format-dialogue {
      text-align: center;
      margin: 0 auto;
      max-width: 70%;
    }
    
    .format-parenthetical {
      text-align: center;
      margin: 0 auto;
      max-width: 60%;
      &::before {
        content: "(";
      }
      &::after {
        content: ")";
      }
    }

    /* Add a specific class for CHARACTER formatting */
    .character-format {
      text-align: center;
    }
  }
`

// Debug panel with test buttons
const DebugPanel = styled.div`
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  display: flex;
  gap: 8px;
  flex-wrap: wrap; /* Allow buttons to wrap */
`;

// Make test button BLACK so it's clearly visible
const TestButton = styled.button`
  background: black;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 4px;
`;

// Dropdown container
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

// Dropdown content
const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 100;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
`;

// Dropdown filter input
const FilterInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-bottom: 1px solid #999;
  }
`;

// Dropdown item
const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;

// Highlighted dropdown item
const SelectedItem = styled(DropdownItem)`
  background-color: #e6f7ff;
`;

const EditorTest = ({ setFormatFunctions }) => {
  const { activeFormat, setFormat } = useEditorFormat();
  const [uppercaseMode, setUppercaseMode] = useState(false);
  const [characterMode, setCharacterMode] = useState(false);
  const [sceneHeadingMode, setSceneHeadingMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { characters } = useCharacterStore();
  const inputRef = useRef(null);
  
  // New state for manually refreshed characters
  const [manualCharacters, setManualCharacters] = useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['paragraph'],
      }),
    ],
    content: '<p></p>',
    autofocus: true,
  });

  // Load characters when dropdown opens to ensure fresh data
  useEffect(() => {
    if (dropdownOpen) {
      console.log('Dropdown opened - loading fresh characters');
      try {
        const storedValue = localStorage.getItem('screenplay_characters');
        console.log('Raw stored value:', storedValue);
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          console.log('Parsed characters from storage:', parsedValue);
          if (Array.isArray(parsedValue)) {
            setManualCharacters(parsedValue);
            console.log('Set manual characters to:', parsedValue);
          }
        } else {
          console.log('No characters found in localStorage');
        }
      } catch (error) {
        console.error('Error loading characters:', error);
      }
    }
  }, [dropdownOpen]);

  // Test function for converting text to uppercase
  const testUppercaseFunction = () => {
    if (!editor) return;
    
    // Get the current selection
    const { from, to } = editor.state.selection;
    
    // Check if there's selected text
    if (from !== to) {
      // Get the selected text
      const selectedText = editor.state.doc.textBetween(from, to);
      
      // Replace with uppercase version
      editor.chain()
        .focus()
        .deleteSelection()
        .insertContent(selectedText.toUpperCase())
        .run();
    }
    
    // Toggle uppercase mode for future typing
    setUppercaseMode(!uppercaseMode);
  };
  
  // Test function for scene heading format (completely separate)
  const testSceneHeadingFunction = () => {
    if (!editor) return;
    
    // Toggle scene heading mode for future typing
    const newMode = !sceneHeadingMode;
    setSceneHeadingMode(newMode);
    
    if (newMode) {
      // Turning ON scene heading mode
      // Apply left alignment
      editor.chain().focus().setTextAlign('left').run();
      
      // Apply bold formatting to current paragraph
      editor.chain().focus().setBold().run();
      
      // Get the current selection
      const { from, to } = editor.state.selection;
      
      // Check if there's selected text
      if (from !== to) {
        // Get the selected text
        const selectedText = editor.state.doc.textBetween(from, to);
        
        // Replace with uppercase bold version
        editor.chain()
          .focus()
          .deleteSelection()
          .setBold()
          .insertContent(selectedText.toUpperCase())
          .run();
      }
    } else {
      // Turning OFF scene heading mode
      // Turn off bold formatting
      editor.chain().focus().unsetBold().run();
    }
  };
  
  // Toggle character dropdown
  const toggleCharacterDropdown = () => {
    console.log('Toggle dropdown called, current state:', !dropdownOpen);
    setDropdownOpen(!dropdownOpen);
    setFilterText('');
    setSelectedIndex(0);
  };
  
  // Handle character selection from dropdown
  const handleSelectCharacter = (character) => {
    if (!editor) return;
    
    // Apply CHARACTER formatting (same as the CHARACTER button)
    editor.chain().focus().setTextAlign('center').run();
    editor.chain().focus().unsetBold().run();
    
    // Insert the character name
    editor.chain()
      .focus()
      .insertContent(character)
      .run();
    
    // Turn on character mode
    setCharacterMode(true);
    setSceneHeadingMode(false);
    
    // Close the dropdown
    setDropdownOpen(false);
  };
  
  // Handle keyboard navigation in the dropdown
  const handleKeyDown = (e) => {
    const filteredChars = manualCharacters.filter(char => 
      char.toLowerCase().startsWith(filterText.toLowerCase())
    );
    
    if (filteredChars.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredChars.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredChars[selectedIndex]) {
          handleSelectCharacter(filteredChars[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setDropdownOpen(false);
        break;
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleClickOutside = (e) => {
      // Don't close if clicking the filter input or the dropdown content
      if (e.target.closest('.character-dropdown')) return;
      setDropdownOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  // Keyboard handler for uppercase mode
  useEffect(() => {
    if (!editor || !uppercaseMode) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle single character input
      if (e.key.length === 1) {
        e.preventDefault();
        editor.commands.insertContent(e.key.toUpperCase());
      }
    };
    
    // Add event listener
    window.addEventListener('keypress', handleKeyPress);
    
    // Clean up
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [editor, uppercaseMode]);

  // Keyboard handler for CHARACTER mode
  useEffect(() => {
    if (!editor || !characterMode) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle single character input
      if (e.key.length === 1) {
        e.preventDefault();
        editor.commands.insertContent(e.key.toUpperCase());
      }
    };
    
    // Add event listener
    window.addEventListener('keypress', handleKeyPress);
    
    // Clean up
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [editor, characterMode]);
  
  // Keyboard handler for SCENE_HEADING mode - completely separate
  useEffect(() => {
    if (!editor) return;
    
    // When scene heading mode changes, update bold formatting
    if (sceneHeadingMode) {
      editor.chain().focus().setBold().run();
    } else {
      editor.chain().focus().unsetBold().run();
    }
    
    if (!sceneHeadingMode) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle single character input
      if (e.key.length === 1) {
        e.preventDefault();
        // Insert uppercase AND bold text
        editor.chain()
          .focus()
          .setBold()
          .insertContent(e.key.toUpperCase())
          .run();
      }
    };
    
    // Add event listener
    window.addEventListener('keypress', handleKeyPress);
    
    // Clean up
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [editor, sceneHeadingMode]);

  // Create format functions and share them up to App
  const formatFunctionsCreated = useRef(false);
  if (editor && !formatFunctionsCreated.current) {
    const formatFunctions = {
      'SCENE_HEADING': () => {
        // Apply the same formatting as our test button
        editor.chain().focus().setTextAlign('left').run();
        
        // Apply bold formatting
        editor.chain().focus().setBold().run();
        
        // Convert selected text to uppercase if any is selected
        const { from, to } = editor.state.selection;
        if (from !== to) {
          const selectedText = editor.state.doc.textBetween(from, to);
          editor.chain()
            .focus()
            .deleteSelection()
            .setBold()
            .insertContent(selectedText.toUpperCase())
            .run();
        }
        
        // Turn on scene heading mode, turn off character mode
        setSceneHeadingMode(true);
        setCharacterMode(false);
      },
      'ACTION': () => {
        editor.chain().focus().setTextAlign('left').run();
        // Turn off bold when switching to ACTION
        editor.chain().focus().unsetBold().run();
        setCharacterMode(false);
        setSceneHeadingMode(false);
      },
      'CHARACTER': () => {
        editor.chain().focus().setTextAlign('center').run();
        
        // Turn off bold when switching to CHARACTER
        editor.chain().focus().unsetBold().run();
        
        const { from, to } = editor.state.selection;
        if (from !== to) {
          const selectedText = editor.state.doc.textBetween(from, to);
          editor.chain()
            .focus()
            .deleteSelection()
            .insertContent(selectedText.toUpperCase())
            .run();
        }
        
        setCharacterMode(true);
        setSceneHeadingMode(false);
      },
      'DIALOGUE': () => {
        editor.chain().focus().setTextAlign('center').run();
        setCharacterMode(false);
        setSceneHeadingMode(false);
      },
      'PARENTHETICAL': () => {
        editor.chain().focus().setTextAlign('center').run();
        setCharacterMode(false);
        setSceneHeadingMode(false);
      }
    };
    
    setFormatFunctions(formatFunctions);
    formatFunctionsCreated.current = true;
  }

  // Filter characters based on the filter text
  const filteredCharacters = manualCharacters.filter(char => 
    char.toLowerCase().startsWith(filterText.toLowerCase())
  );
  
  // Log what's rendered in the dropdown
  console.log('Rendering dropdown. ManualCharacters:', manualCharacters);
  console.log('FilteredCharacters:', filteredCharacters);

  return (
    <>
      <DebugPanel>
        <TestButton onClick={testUppercaseFunction}>
          {uppercaseMode ? 'UPPERCASE MODE ON' : 'Test Uppercase'}
        </TestButton>
        <TestButton onClick={testSceneHeadingFunction}>
          {sceneHeadingMode ? 'SCENE HEADING MODE ON' : 'Test Scene Heading'}
        </TestButton>
        
        {/* Character dropdown test button */}
        <DropdownContainer onClick={(e) => e.stopPropagation()}>
          <TestButton onClick={toggleCharacterDropdown}>
            Test Character Selection
          </TestButton>
          
          {dropdownOpen && (
            <DropdownContent className="character-dropdown">
              <FilterInput
                ref={inputRef}
                autoFocus
                type="text"
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder="Type to filter..."
              />
              
              {filteredCharacters.length === 0 ? (
                <DropdownItem>No matching characters</DropdownItem>
              ) : (
                filteredCharacters.map((char, index) => (
                  index === selectedIndex ? (
                    <SelectedItem 
                      key={index}
                      onClick={() => handleSelectCharacter(char)}
                    >
                      {char}
                    </SelectedItem>
                  ) : (
                    <DropdownItem 
                      key={index}
                      onClick={() => handleSelectCharacter(char)}
                    >
                      {char}
                    </DropdownItem>
                  )
                ))
              )}
            </DropdownContent>
          )}
        </DropdownContainer>
      </DebugPanel>
      <TestCharacterStore editor={editor} />
      <StyledEditorContent editor={editor} />
    </>
  );
};

export default EditorTest 
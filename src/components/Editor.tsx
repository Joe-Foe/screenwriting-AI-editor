import React, { useEffect, useState, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import FormatToolbar from './FormatToolbar';
import InlineCharacterSuggestion from './InlineCharacterSuggestion';
import CharacterInput from './CharacterInput';
import CreatableSelect from 'react-select/creatable';

const Editor = () => {
  const [editor, setEditor] = useState(null);
  const [showCharacterSuggestion, setShowCharacterSuggestion] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [filterText, setFilterText] = useState('');
  const [manualCharacters, setManualCharacters] = useState([]);

  const handleKeyDown = (event) => {
    if (!editor) return;
    
    // Handle @ symbol to trigger character suggestion
    if (event.key === '@') {
      // Get the current position of the cursor
      const view = editor.view;
      const { left, bottom } = view.coordsAtPos(editor.state.selection.from);
      
      // Set position and show suggestion
      setSuggestionPosition({ top: bottom, left });
      setShowCharacterSuggestion(true);
      setFilterText('');
    }
  };

  useEffect(() => {
    if (!editor) return;
    
    // Add event handler
    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  const handleInlineCharacterSelect = (character) => {
    if (!editor) return;
    
    editor.chain().focus().insertContent(character).run();
    setShowCharacterSuggestion(false);
  };

  const handleAddManualCharacter = (character) => {
    // Add character to manualCharacters state
    setManualCharacters([...manualCharacters, character]);
  };

  return (
    <div className="editor-container">
      <FormatToolbar editor={editor} />
      <EditorContent editor={editor} />
      
      {showCharacterSuggestion && (
        <InlineCharacterSuggestion
          position={suggestionPosition}
          onSelect={handleInlineCharacterSelect}
          onClose={() => setShowCharacterSuggestion(false)}
          filterText={filterText}
          onFilterChange={setFilterText}
        />
      )}
      
      <div className="character-input-container">
        <CharacterInput onAddCharacter={handleAddManualCharacter} />
        
        <div className="manual-characters">
          <h3>Manual Characters:</h3>
          <ul>
            {manualCharacters.map((char, index) => (
              <li key={index}>{char}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Editor; 
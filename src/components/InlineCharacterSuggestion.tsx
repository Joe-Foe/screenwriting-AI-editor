import React, { useEffect, useState, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import styled from 'styled-components';
import { useCharacterStore } from '../hooks/useCharacterStore';

const SuggestionContainer = styled.div`
  position: absolute;
  z-index: 9999;
  width: 250px;
  background: white;
  border: 2px solid red;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
`;

interface InlineCharacterSuggestionProps {
  editor: any;
  isVisible: boolean;
  position: { top: number; left: number };
  onSelect: (character: string) => void;
  onClose: () => void;
  currentText: string;
}

const InlineCharacterSuggestion: React.FC<InlineCharacterSuggestionProps> = ({
  editor,
  isVisible,
  position,
  onSelect,
  onClose,
  currentText
}) => {
  const { addCharacter } = useCharacterStore();
  const [options, setOptions] = useState([]);
  const selectRef = useRef(null);

  // Load characters when component is mounted
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem('screenplay_characters');
      if (storedValue) {
        const characterList = JSON.parse(storedValue);
        if (Array.isArray(characterList)) {
          const formattedOptions = characterList.map(char => ({
            value: char,
            label: char
          }));
          setOptions(formattedOptions);
        }
      }
    } catch (error) {
      console.error('Error loading character options:', error);
    }
  }, []);

  // Focus the dropdown when it becomes visible
  useEffect(() => {
    if (isVisible && selectRef.current) {
      setTimeout(() => {
        if (selectRef.current) {
          selectRef.current.focus();
        }
      }, 10);
    }
  }, [isVisible]);

  // Handle selection or creation
  const handleChange = (newValue, actionMeta) => {
    let character;
    
    if (actionMeta.action === 'create-option') {
      // Handle new character creation
      character = newValue.value || newValue.label;
      character = character.toUpperCase();
      
      // Add to character store
      addCharacter(character);
    } else if (actionMeta.action === 'select-option') {
      // Handle existing character selection
      character = newValue.value;
    } else {
      return;
    }
    
    onSelect(character);
  };

  if (!isVisible) return null;

  return (
    <>
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'rgba(255,0,0,0.2)',
          padding: '5px',
          zIndex: 9999
        }}>
          Character suggestion visible at: {position.top}px, {position.left}px
        </div>
      )}
      <SuggestionContainer 
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CreatableSelect
          ref={selectRef}
          options={options}
          onChange={handleChange}
          onBlur={onClose}
          value={null}
          placeholder="Select or create character..."
          formatCreateLabel={(inputValue) => `Add "${inputValue.toUpperCase()}"`}
          inputValue={currentText}
          onInputChange={(newValue) => {
            // Update editor text as user types in the dropdown
            const { from, to } = editor.state.selection;
            const $pos = editor.state.doc.resolve(from);
            const lineStart = $pos.start();
            const lineEnd = $pos.end();
            
            editor.chain()
              .focus()
              .deleteRange({ from: lineStart, to: lineEnd })
              .insertContent(newValue)
              .run();
          }}
          menuIsOpen={true}
          autoFocus
          styles={{
            control: (base) => ({
              ...base,
              background: 'white',
              border: '1px solid #ccc',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              borderRadius: '4px'
            }),
            menu: (base) => ({
              ...base,
              margin: 0,
              boxShadow: 'none',
              border: 'none'
            })
          }}
        />
      </SuggestionContainer>
    </>
  );
};

export default InlineCharacterSuggestion; 
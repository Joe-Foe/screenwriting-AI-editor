import React, { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import styled from 'styled-components';
import { useCharacterStore } from '../hooks/useCharacterStore';

const CharacterInputContainer = styled.div`
  width: 100%;
  margin-bottom: 10px;
  position: relative;
`;

const CharacterInput = ({ onSelect }) => {
  const { characters, addCharacter } = useCharacterStore();
  const [options, setOptions] = useState([]);
  const selectRef = useRef(null);

  // Load characters when component mounts
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
          console.log("Loaded character options:", formattedOptions);
        }
      }
    } catch (error) {
      console.error('Error loading character options:', error);
    }
  }, []);

  // Handle character selection or creation
  const handleChange = (newValue, actionMeta) => {
    let character;
    
    if (actionMeta.action === 'create-option') {
      // Handle new character creation
      character = newValue.value || newValue.label;
      character = character.toUpperCase();
      
      // Add to character store
      addCharacter(character);
      console.log("Created new character:", character);
    } else if (actionMeta.action === 'select-option') {
      // Handle existing character selection
      character = newValue.value;
      console.log("Selected existing character:", character);
    }
    
    if (character && onSelect) {
      onSelect(character);
    }
  };

  return (
    <CharacterInputContainer>
      <CreatableSelect
        ref={selectRef}
        options={options}
        onChange={handleChange}
        placeholder="Select or create a character..."
        formatCreateLabel={(inputValue) => `Add "${inputValue.toUpperCase()}"`}
        styles={{
          control: (base) => ({
            ...base,
            background: 'white',
            borderColor: '#ccc',
            height: '38px',
            minHeight: '38px',
            boxShadow: 'none',
            '&:hover': {
              borderColor: '#999'
            }
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999
          })
        }}
        isClearable={false}
        autoFocus
      />
    </CharacterInputContainer>
  );
};

export default CharacterInput; 
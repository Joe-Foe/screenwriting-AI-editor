import React, { useState } from 'react';
import { useCharacterStore } from '../hooks/useCharacterStore';
import styled from 'styled-components';

// Style to prevent editor from capturing clicks
const CharacterForm = styled.div`
  padding: 20px;
  border: 1px solid #ccc;
  margin: 10px 0;
  z-index: 10;
  position: relative;
  background: white;
`;

const StyledButton = styled.button`
  background: #333;
  color: white;
  padding: 6px 12px;
  border: none;
  margin-left: 8px;
  cursor: pointer;
`;

const StyledInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  width: 200px;
`;

const CharacterItem = styled.li`
  margin: 5px 0;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

// Props to receive the editor instance
interface TestCharacterStoreProps {
  editor?: any;
  notifyCharacterAdded?: () => void;
}

const TestCharacterStore: React.FC<TestCharacterStoreProps> = ({ 
  editor,
  notifyCharacterAdded
}) => {
  const { addCharacter, characters } = useCharacterStore();
  const [newCharacter, setNewCharacter] = useState('');
  
  console.log('TestCharacterStore renders with characters:', characters);
  
  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing
    
    if (newCharacter.trim()) {
      console.log('Adding character in TestCharacterStore:', newCharacter.trim());
      // Add to local store
      addCharacter(newCharacter);
      
      // Notify parent component that a character was added
      if (notifyCharacterAdded) {
        notifyCharacterAdded();
      }
      
      setNewCharacter('');
      
      // Log characters after adding
      console.log('Characters after adding:', characters);
      
      // Also check localStorage directly
      try {
        const storedValue = localStorage.getItem('screenplay_characters');
        console.log('Current localStorage value:', storedValue);
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    }
  };
  
  // Insert a character into the editor
  const insertCharacter = (character: string) => {
    if (!editor) return;
    
    // Apply CHARACTER formatting
    editor.chain().focus().setTextAlign('center').run();
    
    // Turn off bold (in case we were in SCENE_HEADING)
    editor.chain().focus().unsetBold().run();
    
    // Insert the character name
    editor.chain()
      .focus()
      .insertContent(character)
      .run();
  };
  
  return (
    <CharacterForm onClick={(e) => e.stopPropagation()}>
      <h3>Character Store Test</h3>
      
      <form onSubmit={handleAddCharacter}>
        <StyledInput
          type="text"
          value={newCharacter}
          onChange={(e) => setNewCharacter(e.target.value)}
          placeholder="Enter character name"
          onClick={(e) => e.stopPropagation()}
        />
        <StyledButton type="submit">
          Add Character
        </StyledButton>
      </form>
      
      <div style={{ marginTop: '10px' }}>
        <h4>Stored Characters:</h4>
        {characters.length === 0 ? (
          <p><em>No characters stored yet</em></p>
        ) : (
          <ul>
            {characters.map((char, index) => (
              <CharacterItem 
                key={index} 
                onClick={() => insertCharacter(char)}
              >
                {char}
              </CharacterItem>
            ))}
          </ul>
        )}
      </div>
    </CharacterForm>
  );
};

export default TestCharacterStore; 
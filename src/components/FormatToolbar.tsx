import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useEditorFormat, ScreenplayFormatType } from '../hooks/useEditorFormat';
import { useCharacterStore } from '../hooks/useCharacterStore';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const ToolbarContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #ccc;
  background-color: #f5f5f5;
`;

const FormatButton = styled.button<{ isActive?: boolean }>`
  padding: 6px 12px;
  background-color: ${props => props.isActive ? '#007bff' : '#ffffff'};
  color: ${props => props.isActive ? '#ffffff' : '#333333'};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.isActive ? '#0069d9' : '#f0f0f0'};
  }
`;

// Test button style that won't interfere with existing buttons
const TestButton = styled(FormatButton)`
  background-color: #28a745;
  color: white;
  margin-left: 10px;
  
  &:hover {
    background-color: #218838;
  }
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

// Add this button style (can go after TestButton)
const RetardButton = styled(FormatButton)`
  background-color: #dc3545;
  color: white;
  margin-left: 10px;
  
  &:hover {
    background-color: #c82333;
  }
`;

const FormatToolbar = ({ formatFunctions }) => {
  const { activeFormat, setFormat } = useEditorFormat();
  const { addCharacter } = useCharacterStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [characters, setCharacters] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Add state just for the test button
  const [testDropdownOpen, setTestDropdownOpen] = useState(false);
  const [testOptions, setTestOptions] = useState([]);

  // Add a ref for the select component
  const selectRef = useRef(null);

  // Add these state variables to your FormatToolbar component
  const [retardDropdownOpen, setRetardDropdownOpen] = useState(false);
  const [retardOptions, setRetardOptions] = useState([
    { value: 'CLAUDE', label: 'CLAUDE' },
    { value: 'IS', label: 'IS' },
    { value: 'RETARTED', label: 'RETARTED' }
  ]);

  // Add this state variable to your component
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });

  const formatButtons: {label: string, format: ScreenplayFormatType}[] = [
    { label: 'Scene Heading', format: 'SCENE_HEADING' },
    { label: 'Action', format: 'ACTION' },
    { label: 'Character', format: 'CHARACTER' },
    { label: 'Dialogue', format: 'DIALOGUE' },
    { label: 'Parenthetical', format: 'PARENTHETICAL' },
  ];

  // Load characters when needed
  useEffect(() => {
    if (dropdownOpen) {
      try {
        const storedValue = localStorage.getItem('screenplay_characters');
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          if (Array.isArray(parsedValue)) {
            setCharacters(parsedValue);
          }
        }
      } catch (error) {
        console.error('Error loading characters:', error);
      }
    }
  }, [dropdownOpen]);

  // Load test options when dropdown opens
  useEffect(() => {
    if (testDropdownOpen) {
      try {
        // Load from localStorage (as our character store does)
        const storedValue = localStorage.getItem('screenplay_characters');
        if (storedValue) {
          const characterList = JSON.parse(storedValue);
          if (Array.isArray(characterList)) {
            // Convert to the format CreatableSelect expects
            const formattedOptions = characterList.map(char => ({
              value: char,
              label: char
            }));
            setTestOptions(formattedOptions);
          }
        }
      } catch (error) {
        console.error('Error loading character options:', error);
      }
    }
  }, [testDropdownOpen]);

  // Add an effect to focus the dropdown after it opens
  useEffect(() => {
    if (testDropdownOpen && selectRef.current) {
      // Small timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        // Access the select's input directly through the ref's API
        if (selectRef.current) {
          selectRef.current.focus();
        }
      }, 50);
    }
  }, [testDropdownOpen]);

  // Add useEffect to load stored options when component mounts
  useEffect(() => {
    try {
      const storedOptions = localStorage.getItem('retard_options');
      if (storedOptions) {
        const parsedOptions = JSON.parse(storedOptions);
        if (Array.isArray(parsedOptions)) {
          setRetardOptions(parsedOptions);
        }
      }
    } catch (error) {
      console.error('Error loading retard options:', error);
    }
  }, []);

  // Character button click handler
  const toggleCharacterDropdown = (e) => {
    e.stopPropagation();
    
    // Check if there's text selected
    if (window.editor) {
      const { from, to } = window.editor.state.selection;
      
      if (from !== to) {
        // Text is selected - format and add as character
        formatFunctions['CHARACTER']();
        
        const selectedText = window.editor.state.doc.textBetween(from, to);
        const characterToAdd = selectedText.trim().toUpperCase();
        
        if (characterToAdd) {
          addCharacter(characterToAdd);
        }
        
        // Don't open dropdown for selections
        return;
      }
    }
    
    // No text selected - apply format and toggle dropdown
    formatFunctions['CHARACTER']();
    setDropdownOpen(!dropdownOpen);
    setFilterText('');
    setSelectedIndex(0);
  };

  // Handle keyboard navigation in the dropdown
  const handleKeyDown = (e) => {
    const filteredChars = characters.filter(char => 
      char.toLowerCase().startsWith(filterText.toLowerCase())
    );
    
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
        if (filteredChars.length > 0) {
          handleSelectCharacter(filteredChars[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setDropdownOpen(false);
        break;
    }
  };

  // Handle character selection from regular dropdown
  const handleSelectCharacter = (character) => {
    formatFunctions['CHARACTER']();
    
    if (window.editor) {
      window.editor.chain()
        .focus()
        .insertContent(character)
        .run();
    }
    
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleClickOutside = (e) => {
      if (e.target.closest('.character-dropdown')) return;
      setDropdownOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Filter characters based on the filter text
  const filteredCharacters = characters.filter(char => 
    char.toLowerCase().startsWith(filterText.toLowerCase())
  );

  const handleFormatClick = (format) => {
    // Update the active format
    setFormat(format);
    
    // Apply the format
    if (formatFunctions && formatFunctions[format]) {
      formatFunctions[format]();
    }
  };

  // Toggle the test dropdown visibility
  const toggleTestDropdown = (e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent default to ensure editor doesn't keep focus
    
    // Apply CHARACTER format
    formatFunctions['CHARACTER']();
    
    // Toggle dropdown
    setTestDropdownOpen(!testDropdownOpen);
    
    // If we're opening the dropdown, blur the editor to release focus
    if (!testDropdownOpen && window.editor) {
      window.editor.commands.blur();
    }
  };
  
  // Handle changes from the CreatableSelect
  const handleTestChange = (newValue, actionMeta) => {
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
      // Other actions like clear, ignore them
      return;
    }
    
    // Insert the character in the editor
    if (window.editor) {
      window.editor.chain()
        .focus()
        .insertContent(character)
        .run();
    }
    
    // Close the dropdown
    setTestDropdownOpen(false);
  };

  // Replace the handleRetardButtonClick function
  const handleRetardButtonClick = (e) => {
    e.stopPropagation();
    console.log("RETARD CLAUDE button clicked");
    
    // Get the editor instance
    if (!window.editor) {
      console.error("Editor not available");
      return;
    }
    
    try {
      // First, insert a placeholder at cursor
      window.editor.chain()
        .focus()
        .insertContent('<span class="mention-marker">@</span>')
        .run();
      
      // Find the marker we just inserted
      const mentionMarker = document.querySelector('.mention-marker');
      if (!mentionMarker) {
        throw new Error("Mention marker not found");
      }
      
      // Get the rect of the marker
      const markerRect = mentionMarker.getBoundingClientRect();
      console.log("Marker position:", markerRect);
      
      // Position dropdown at the marker
      setCursorPosition({
        top: markerRect.bottom,
        left: markerRect.left
      });
      
      // Show dropdown
      setRetardDropdownOpen(true);
      
      // Remember the position so we can replace it later
      window.mentionPosition = {
        from: window.editor.state.selection.from - 1,
        to: window.editor.state.selection.from
      };
    } catch (error) {
      console.error("Error setting up mention:", error);
    }
  };

  // Update the handleRetardSelect function
  const handleRetardSelect = (newValue, actionMeta) => {
    if (!window.editor || !window.mentionPosition) return;
    
    let text;
    
    if (actionMeta.action === 'create-option') {
      // Handle new option
      text = newValue.value;
      
      // Save to options
      const updatedOptions = [...retardOptions, { value: text, label: text }];
      setRetardOptions(updatedOptions);
      localStorage.setItem('retard_options', JSON.stringify(updatedOptions));
    } else {
      text = newValue.value;
    }
    
    // Remove the placeholder and insert the selected text
    window.editor.chain()
      .focus()
      .deleteRange(window.mentionPosition)
      .insertContent(text)
      .run();
    
    // Clean up
    window.mentionPosition = null;
    setRetardDropdownOpen(false);
  };

  return (
    <ToolbarContainer>
      {/* Regular format buttons */}
      {formatButtons.map(button => {
        // Special handling for CHARACTER format
        if (button.format === 'CHARACTER') {
          return (
            <DropdownContainer key={button.format} onClick={e => e.stopPropagation()}>
              <FormatButton 
                isActive={activeFormat === button.format}
                onClick={toggleCharacterDropdown}
              >
                {button.label}
              </FormatButton>
              
              {dropdownOpen && (
                <DropdownContent className="character-dropdown" ref={dropdownRef}>
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
          );
        }
        
        // Regular format buttons
        return (
          <FormatButton 
            key={button.format}
            isActive={activeFormat === button.format}
            onClick={() => handleFormatClick(button.format)}
          >
            {button.label}
          </FormatButton>
        );
      })}
      
      {/* Test button at the end */}
      <TestButton onClick={toggleTestDropdown}>
        TEST CHARACTER
      </TestButton>
      
      {testDropdownOpen && (
        <div 
          style={{
            position: 'absolute',
            zIndex: 100,
            width: 250,
            right: '10px',
            top: '40px', 
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <CreatableSelect
            ref={selectRef}
            options={testOptions}
            onChange={handleTestChange}
            autoFocus
            placeholder="Select or create a character..."
            formatCreateLabel={(inputValue) => `Add "${inputValue.toUpperCase()}"`}
            menuIsOpen={true}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxShadow: 'none'
              }),
              menu: (base) => ({
                ...base,
                margin: 0,
                border: 'none',
                boxShadow: 'none'
              })
            }}
          />
        </div>
      )}

      {/* Retard button at the end */}
      <RetardButton onClick={handleRetardButtonClick}>
        RETARD CLAUDE
      </RetardButton>

      {retardDropdownOpen && (
        <div 
          style={{
            position: 'absolute',
            zIndex: 9999,
            width: 250,
            top: `${cursorPosition.top}px`, 
            left: `${cursorPosition.left}px`,
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CreatableSelect
            autoFocus
            options={retardOptions}
            onChange={handleRetardSelect}
            menuIsOpen={true}
            formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
            placeholder="Select or create..."
            styles={{
              control: (base) => ({
                ...base,
                background: 'white',
                borderColor: '#ccc',
                boxShadow: 'none'
              }),
              menu: (base) => ({
                ...base,
                margin: 0,
                boxShadow: 'none',
                border: 'none'
              })
            }}
          />
        </div>
      )}
    </ToolbarContainer>
  );
};

export default FormatToolbar; 
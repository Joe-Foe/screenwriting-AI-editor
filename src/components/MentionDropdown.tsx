import React, { useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: absolute;
  z-index: 9999;
  width: 250px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
`;

interface MentionDropdownProps {
  isVisible: boolean;
  position: { top: number; left: number };
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string, isNew: boolean) => void;
  onClose: () => void;
  onCreateOption?: (newValue: string) => void;
  placeholder?: string;
  storageKey?: string;
}

const MentionDropdown: React.FC<MentionDropdownProps> = ({
  isVisible,
  position,
  options,
  onSelect,
  onClose,
  onCreateOption,
  placeholder = "Select or create...",
  storageKey
}) => {
  const selectRef = useRef(null);

  // Focus the dropdown when it becomes visible
  useEffect(() => {
    if (isVisible && selectRef.current) {
      setTimeout(() => {
        selectRef.current?.focus();
      }, 10);
    }
  }, [isVisible]);

  // Handle selection or creation
  const handleChange = (newValue, actionMeta) => {
    if (!newValue) return;

    if (actionMeta.action === 'create-option') {
      // New option created
      const value = newValue.value;
      
      // Save to localStorage if storageKey is provided
      if (storageKey) {
        try {
          const updatedOptions = [...options, { value, label: value }];
          localStorage.setItem(storageKey, JSON.stringify(updatedOptions));
        } catch (error) {
          console.error(`Error saving to ${storageKey}:`, error);
        }
      }
      
      // Call onCreateOption callback if provided
      if (onCreateOption) {
        onCreateOption(value);
      }
      
      // Call onSelect with the new value
      onSelect(value, true);
    } else if (actionMeta.action === 'select-option') {
      // Existing option selected
      onSelect(newValue.value, false);
    }
    
    // Close the dropdown
    onClose();
  };

  if (!isVisible) return null;

  return (
    <DropdownContainer
      style={{
        top: position.top + 'px',
        left: position.left + 'px'
      }}
      onClick={e => e.stopPropagation()}
    >
      <CreatableSelect
        ref={selectRef}
        options={options}
        onChange={handleChange}
        onBlur={onClose}
        autoFocus
        menuIsOpen={true}
        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
        placeholder={placeholder}
        styles={{
          control: (base) => ({
            ...base,
            background: 'white',
            borderColor: '#ccc',
            boxShadow: 'none',
            minHeight: '38px'
          }),
          menu: (base) => ({
            ...base,
            margin: 0,
            boxShadow: 'none',
            border: 'none'
          }),
          menuList: (base) => ({
            ...base,
            maxHeight: '200px'
          })
        }}
        components={{
          DropdownIndicator: null, // Remove dropdown arrow
          IndicatorSeparator: null // Remove separator
        }}
      />
    </DropdownContainer>
  );
};

export default MentionDropdown; 
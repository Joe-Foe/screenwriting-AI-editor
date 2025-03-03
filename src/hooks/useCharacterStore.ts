import { useState, useEffect } from 'react';

// Key for localStorage
const STORAGE_KEY = 'screenplay_characters';

/**
 * Custom hook to manage a list of character names for the screenplay editor
 */
export function useCharacterStore() {
  // State to store the list of characters
  const [characters, setCharacters] = useState<string[]>(() => {
    // Initialize from localStorage immediately during state initialization
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        if (Array.isArray(parsedValue)) {
          console.log('Loaded characters from storage:', parsedValue);
          return parsedValue;
        }
      }
    } catch (error) {
      console.error('Error loading characters from storage:', error);
    }
    return [];
  });
  
  // Save to localStorage whenever characters change
  useEffect(() => {
    console.log('Saving characters to storage:', characters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);
  
  // Add a new character to the list (avoid duplicates)
  const addCharacter = (name: string) => {
    // Normalize character name (trim whitespace, convert to uppercase)
    const normalizedName = name.trim().toUpperCase();
    
    // Don't add empty strings
    if (!normalizedName) return;
    
    // Don't add duplicates
    if (!characters.includes(normalizedName)) {
      console.log('Adding character:', normalizedName);
      setCharacters(prev => [...prev, normalizedName]);
    }
  };
  
  // Clear all characters (for testing)
  const clearCharacters = () => {
    setCharacters([]);
  };
  
  return {
    addCharacter,
    clearCharacters,
    characters
  };
} 
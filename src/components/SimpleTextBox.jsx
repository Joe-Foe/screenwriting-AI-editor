import React, { useState } from 'react'

const SimpleTextBox = () => {
  // Add state to track the input value
  const [inputValue, setInputValue] = useState('')
  
  // Function to add the character to localStorage
  const addCharacterToLocalStorage = () => {
    // Don't add empty names
    if (!inputValue.trim()) return
    
    // Get current characters from localStorage
    const stored = localStorage.getItem('screenplay-characters')
    let characters = []
    
    if (stored) {
      try {
        characters = JSON.parse(stored)
        console.log('Current characters in localStorage:', characters)
      } catch (error) {
        console.error('Error parsing localStorage characters:', error)
      }
    }
    
    // Check if character already exists (case insensitive)
    const nameExists = characters.some(
      name => name.toLowerCase() === inputValue.trim().toLowerCase()
    )
    
    if (!nameExists) {
      // Add the new character (in uppercase for screenplay convention)
      const newName = inputValue.trim().toUpperCase()
      console.log('Adding new character:', newName)
      
      // Check if the name contains spaces
      if (newName.includes(' ')) {
        console.log('Note: Character name contains spaces, which may affect filtering in the mention dropdown')
      }
      
      characters.push(newName)
      
      // Save back to localStorage
      localStorage.setItem('screenplay-characters', JSON.stringify(characters))
      
      console.log(`Added new character: ${newName}`)
      console.log('Updated characters in localStorage:', characters)
      
      // Dispatch a custom event to notify SimpleEditor
      window.dispatchEvent(new Event('screenplay-characters-updated'))
      
      // Clear the input field
      setInputValue('')
    } else {
      console.log(`Character "${inputValue}" already exists`)
    }
  }
  
  // Handle Enter key press in the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCharacterToLocalStorage()
    }
  }
  
  return (
    <div style={{ padding: '10px', margin: '10px 0', display: 'flex', alignItems: 'center' }}>
      <input 
        type="text"
        placeholder="This input does absolutely nothing"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ 
          padding: '8px', 
          width: '300px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginRight: '10px'
        }}
      />
      <button
        onClick={addCharacterToLocalStorage}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4a7fbd',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Do Nothing
      </button>
    </div>
  )
}

export default SimpleTextBox 
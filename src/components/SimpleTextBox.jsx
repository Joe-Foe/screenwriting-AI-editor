import React from 'react'

const SimpleTextBox = () => {
  return (
    <div style={{ padding: '10px', margin: '10px 0', display: 'flex', alignItems: 'center' }}>
      <input 
        type="text"
        placeholder="This input does absolutely nothing"
        style={{ 
          padding: '8px', 
          width: '300px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginRight: '10px'
        }}
      />
      <button
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
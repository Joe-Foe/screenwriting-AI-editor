// Helper functions for mentions

// Insert a mention trigger marker at the current cursor position
export const insertMentionTrigger = (editor) => {
  if (!editor) return null;
  
  try {
    // Focus the editor and insert a temporary marker
    editor.chain()
      .focus()
      .insertContent('<span class="mention-marker">@</span>')
      .run();
    
    // Find the inserted marker
    const marker = document.querySelector('.mention-marker');
    if (!marker) return null;
    
    // Get marker position
    const markerRect = marker.getBoundingClientRect();
    
    // Return position information
    return {
      position: {
        top: markerRect.bottom,
        left: markerRect.left
      },
      range: {
        from: editor.state.selection.from - 1,
        to: editor.state.selection.from
      }
    };
  } catch (error) {
    console.error('Error setting up mention:', error);
    return null;
  }
};

// Replace the mention trigger with the selected value
export const replaceMentionTrigger = (editor, range, text) => {
  if (!editor || !range) return false;
  
  try {
    editor.chain()
      .focus()
      .deleteRange(range)
      .insertContent(text)
      .run();
    return true;
  } catch (error) {
    console.error('Error replacing mention:', error);
    return false;
  }
};

// Load options from localStorage
export const loadOptionsFromStorage = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error loading options from ${key}:`, error);
    return [];
  }
}; 
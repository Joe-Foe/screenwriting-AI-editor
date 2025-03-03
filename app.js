import createMentionEditor from './mention.js'
import './mention.css'

// When your app loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, looking for editor element')
  const editorElement = document.querySelector('#editor')
  
  if (!editorElement) {
    console.error('Editor element not found! Make sure you have a div with id="editor" in your HTML.')
    return
  }
  
  console.log('Found editor element:', editorElement)
  const editor = createMentionEditor(editorElement)
  
  // For debugging
  console.log('Editor initialized:', editor)
  window.editor = editor // Make editor available in console
  
  // Add debugging button functionality
  const checkMentionButton = document.getElementById('checkMention')
  const debugOutput = document.getElementById('debugOutput')
  
  if (checkMentionButton && debugOutput) {
    checkMentionButton.addEventListener('click', () => {
      const mentionExtension = editor.extensionManager.extensions.find(ext => ext.name === 'mention')
      
      debugOutput.textContent = JSON.stringify({
        hasMentionExtension: !!mentionExtension,
        mentionConfig: mentionExtension ? mentionExtension.options : null,
        editorWorking: !!editor.isEditable,
      }, null, 2)
    })
  }
  
  // Additional testing - force a mention suggestion
  setTimeout(() => {
    try {
      console.log('Adding test text to editor')
      editor.commands.insertContent('Testing @')
      console.log('Editor HTML after inserting test text:', editorElement.innerHTML)
    } catch (error) {
      console.error('Error inserting test content:', error)
    }
  }, 2000)
})

// To destroy when needed
// editor.destroy() 
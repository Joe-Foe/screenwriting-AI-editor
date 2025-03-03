import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

// Simple suggestion logic
const suggestion = {
  items: ({ query }) => {
    console.log('Suggestion query:', query);
    const items = [
      { id: '1', label: 'Alice' },
      { id: '2', label: 'Bob' },
      { id: '3', label: 'Charlie' },
      { id: '4', label: 'David' },
      { id: '5', label: 'Eve' },
    ].filter(item => 
      item.label.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 5);
    console.log('Filtered items:', items);
    return items;
  },
  
  render: () => {
    let popup;
    let component;

    return {
      onStart: props => {
        // Create the component
        component = document.createElement('div');
        component.classList.add('mention-popup');
        
        // Make sure it's visible with strong styling
        component.style.position = 'absolute';
        component.style.zIndex = '99999'; // Very high z-index
        component.style.background = 'white';
        component.style.border = '2px solid blue'; // Make it very visible for debugging
        component.style.padding = '10px';
        component.style.borderRadius = '4px';
        component.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        component.style.minWidth = '150px';
        
        // Create suggestion items with strong styling
        component.innerHTML = props.items
          .map((item, index) => 
            `<div class="mention-item" data-index="${index}" style="padding:8px; cursor:pointer; margin-bottom:4px; border-radius:4px;">${item.label}</div>`
          )
          .join('');
        
        // Add click handlers to items
        component.querySelectorAll('.mention-item').forEach((item, index) => {
          item.addEventListener('click', () => {
            props.command({ id: props.items[index].id, label: props.items[index].label });
            popup[0].destroy();
          });
          
          // Add hover effect directly in JS
          item.addEventListener('mouseover', () => {
            item.style.background = '#E8F5FE';
          });
          item.addEventListener('mouseout', () => {
            item.style.background = 'transparent';
          });
        });
        
        // Force append to body directly for debugging
        document.body.appendChild(component);
        
        // Position it manually for debugging
        const rect = props.clientRect();
        component.style.top = `${rect.bottom + window.scrollY}px`;
        component.style.left = `${rect.left + window.scrollX}px`;
        
        // Still create tippy as a backup method
        try {
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            // Add these options to ensure visibility
            zIndex: 99999,
            theme: 'light-border',
            arrow: true,
          });
          
          // Force show
          popup[0].show();
        } catch (error) {
          console.error('Error creating tippy popup:', error);
        }
      },
      
      onUpdate: props => {
        console.log('onUpdate called with props:', props);
        // Update the items
        component.innerHTML = props.items
          .map((item, index) => 
            `<div class="mention-item" data-index="${index}">${item.label}</div>`
          )
          .join('');
          
        console.log('Updated suggestion HTML:', component.innerHTML);
          
        // Re-add click handlers
        component.querySelectorAll('.mention-item').forEach((item, index) => {
          item.addEventListener('click', () => {
            props.command({ id: props.items[index].id, label: props.items[index].label });
            popup[0].destroy();
          });
        });
        
        // Update position
        try {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        } catch (error) {
          console.error('Error updating tippy popup:', error);
        }
      },
      
      onKeyDown: props => {
        console.log('onKeyDown called with key:', props.event.key);
        // Handle keyboard navigation and selection
        if (props.event.key === 'ArrowDown') {
          props.event.preventDefault();
          const currentIndex = props.items.findIndex(item => item.id === props.command.props?.id);
          const nextIndex = (currentIndex + 1) % props.items.length;
          console.log('ArrowDown - selecting index:', nextIndex);
          props.command({ id: props.items[nextIndex].id, label: props.items[nextIndex].label });
          return true;
        }
        
        if (props.event.key === 'ArrowUp') {
          props.event.preventDefault();
          const currentIndex = props.items.findIndex(item => item.id === props.command.props?.id);
          const prevIndex = (currentIndex + props.items.length - 1) % props.items.length;
          console.log('ArrowUp - selecting index:', prevIndex);
          props.command({ id: props.items[prevIndex].id, label: props.items[prevIndex].label });
          return true;
        }
        
        if (props.event.key === 'Enter') {
          props.event.preventDefault();
          const currentIndex = props.items.findIndex(item => item.id === props.command.props?.id) || 0;
          console.log('Enter - selecting index:', currentIndex);
          props.command({ id: props.items[currentIndex].id, label: props.items[currentIndex].label });
          return true;
        }
        
        return false;
      },
      
      onExit: () => {
        console.log('onExit called');
        try {
          popup[0].destroy();
        } catch (error) {
          console.error('Error destroying tippy popup:', error);
        }
      },
    };
  },
};

// Create and mount the editor
const createMentionEditor = (element) => {
  console.log('Creating mention editor for element:', element);
  
  const editor = new Editor({
    element,
    extensions: [
      StarterKit,
      Mention.configure({
        suggestion,
        HTMLAttributes: {
          class: 'mention',
        },
        char: '@',
        renderLabel: ({ options, node }) => {
          return `${options.char}${node.attrs.label}`;
        },
      }),
    ],
    content: '<p>Type @ to mention someone</p>',
    onTransaction: ({ transaction }) => {
      // Log when transactions occur
      console.log('Editor transaction:', transaction);
    },
  });
  
  console.log('Editor created:', editor);
  
  // Added check to confirm @ triggers are working
  console.log('Editor has mention extension:', !!editor.extensionManager.extensions.find(ext => ext.name === 'mention'));
  
  return editor;
};

export default createMentionEditor 
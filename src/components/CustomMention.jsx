import React, { useState, useEffect, useCallback, forwardRef } from 'react'
// Let's check if this file originally had this import
// import { MdPersonOutline } from 'react-icons/md'

export default forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index) => {
    const item = props.items[index]

    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    const index = (selectedIndex + props.items.length - 1) % props.items.length
    setSelectedIndex(index)
  }

  const downHandler = () => {
    const index = (selectedIndex + 1) % props.items.length
    setSelectedIndex(index)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        enterHandler()
        return true
      }

      if (event.key === 'Escape') {
        props.editor.commands.focus()
        return true
      }

      return false
    },
    [props, selectedIndex, setSelectedIndex]
  )

  useEffect(() => {
    return () => {
      props.editor.off('focus')
    }
  }, [])

  useEffect(() => {
    props.editor.on('focus', () => {
      props.editor.commands.focus()
    })
    props.editor.on('keydown', ({ event }) => {
      if (event.key === 'Escape') {
        props.editor.commands.focus()
        return true
      }
      return false
    })
  }, [props.editor])

  return (
    <div className='items' ref={ref}>
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
            ref={index === selectedIndex ? (element) => element?.scrollIntoView() : null}
          >
            <span className='is-text'>{item.label}</span>
          </button>
        ))
      ) : (
        props.query.length > 0 && (
          <div className='item is-empty'>No result</div>
        )
      )}
    </div>
  )
}) 
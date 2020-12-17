import React from 'react'

const initialDnDState = {
  draggedFrom: null,
  draggedTo: null,
  isDragging: false,
  originalOrder: [],
  updatedOrder: []
}

export default function FormFields(props) {
  const [list, setList] = React.useState(props.controls)
  const [dragAndDrop, setDragAndDrop] = React.useState(initialDnDState)

  // onDragStart fires when an element
  // starts being dragged
  const onDragStart = (event) => {
    const initialPosition = parseInt(event.currentTarget.dataset.position)

    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: list
    })

    // Note: this is only for Firefox.
    // Without it, the DnD won't work.
    // But we are not using it.
    event.dataTransfer.setData('text/html', '')
  }

  // onDragOver fires when an element being dragged
  // enters a droppable area.
  // In this case, any of the items on the list
  const onDragOver = (event) => {
    // in order for the onDrop
    // event to fire, we have
    // to cancel out this one
    event.preventDefault()

    let newList = dragAndDrop.originalOrder

    // index of the item being dragged
    const draggedFrom = dragAndDrop.draggedFrom

    // index of the droppable area being hovered
    const draggedTo = parseInt(event.currentTarget.dataset.position)

    const itemDragged = newList[draggedFrom]
    const remainingItems = newList.filter(
      (item, index) => index !== draggedFrom
    )

    newList = [
      ...remainingItems.slice(0, draggedTo),
      itemDragged,
      ...remainingItems.slice(draggedTo)
    ]

    if (draggedTo !== dragAndDrop.draggedTo) {
      setDragAndDrop({
        ...dragAndDrop,
        updatedOrder: newList,
        draggedTo: draggedTo
      })
    }
  }

  const onDrop = (event) => {
    setList(dragAndDrop.updatedOrder)

    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: null,
      draggedTo: null,
      isDragging: false
    })
  }

  const onDragLeave = () => {
    setDragAndDrop({
      ...dragAndDrop,
      draggedTo: null
    })
  }

  // Not needed, just for logging purposes:
  React.useEffect(() => {
    console.log('Dragged From: ', dragAndDrop && dragAndDrop.draggedFrom)
    console.log('Dropping Into: ', dragAndDrop && dragAndDrop.draggedTo)
  }, [dragAndDrop])

  React.useEffect(() => {
    console.log('List updated!')
  }, [list])

  return (
    <ul className='dragableUi' key={list}>
      {Object.keys(props.controls).map((item, index) => {
        return (
          <li
            onClick={props.itemClickEvent}
            key={index}
            data-position={index}
            data-id={item}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
            className={
              dragAndDrop && dragAndDrop.draggedTo === parseInt(index)
                ? 'dropArea'
                : ''
            }
          >
            <p>{props.controls[item].title}</p>
            <i className='fas fa-arrows-alt-v' />
            <a
              key={'delete' + item}
              name={item}
              href='javascript:void(0);'
              onClick={props.clickevent}
            >
              <i className='fa fa-trash' />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

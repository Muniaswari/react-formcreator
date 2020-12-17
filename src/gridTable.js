import React, { useEffect, useRef, useState } from 'react'

export default (props) => {
  const [fieldCount, setFieldCount] = useState(3)
  const [currentRow, setCurrentRow] = useState({
    currentCellIndex: -1,
    currentRowIndex: -1
  })
  const [lists, setLists] = useState([{ field1: '', field2: '' }])
  const tableRef = useRef(null)
  const [resizerStatus, setResizerStatus] = useState(false)

  useEffect(() => {
    const table = document.getElementById('resizeMe')
    const tableBody = table.querySelector('#tblBody')

    tableBody.addEventListener('contextmenu', onContextMenu, false)

    return () => {
      tableBody.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  useEffect(() => {
    console.log(currentRow)
  }, [currentRow])

  useEffect(() => {
    console.log(lists)
  }, [lists])

  //context menu start
  function showMenu(x, y) {
    const menu = document.querySelector('.menu')
    menu.style.left = x + 'px'
    menu.style.top = y + 'px'
    menu.classList.add('menu-show')
  }

  function hideMenu() {
    const menu = document.querySelector('.menu')
    menu.classList.remove('menu-show')
  }

  function onContextMenu(e) {
    e.preventDefault()
    let td = e.target.closest('td')
    const clientRect = td.getBoundingClientRect()
    showMenu(clientRect.x, clientRect.y)
    const tableBody = document.getElementById('tblBody')
    tableBody.addEventListener('mousedown', onMouseDown, false)

    if (!td && !tableBody.contains(td)) {
      return
    } else {
      setCurrentRow({
        currentCellIndex: td.cellIndex,
        currentRowIndex: td.parentNode.rowIndex - 1
      })
    }
    console.log(currentRow)
  }

  function onMouseDown(e) {
    hideMenu()
    const tableBody = document.getElementById('tblBody')
    tableBody.removeEventListener('mousedown', onMouseDown)
  }
  //context menu end

  //move tbody rows start
  let draggingEle
  let draggingRowIndex
  let draggingColumnIndex
  let placeholder
  let list
  let isDraggingStarted = false

  // The current position of mouse relative to the dragging element
  let x = 0
  let y = 0

  // Swap two nodes
  const swap = function (nodeA, nodeB) {
    const parentA = nodeA.parentNode
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB)

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA)
  }

  // Check if `nodeA` is above `nodeB`
  const isAbove = function (nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect()
    const rectB = nodeB.getBoundingClientRect()

    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2
  }

  const cloneTable = function () {
    const table = tableRef.current
    if (table) {
      const rect = table.getBoundingClientRect()
      const width = parseInt(window.getComputedStyle(table).width)

      list = document.createElement('div')
      list.classList.add('clone-list')
      list.style.position = 'absolute'
      list.style.left = `${rect.left}px`
      list.style.top = `${rect.top}px`
      table.parentNode.insertBefore(list, table)

      // Hide the original table
      table.style.visibility = 'hidden'

      table.querySelectorAll('tr').forEach(function (row) {
        // Create a new table from given row
        const item = document.createElement('div')
        item.classList.add('draggable')

        const newTable = document.createElement('table')
        newTable.setAttribute('class', 'clone-table')
        newTable.style.width = `${width}px`

        const newRow = document.createElement('tr')
        const cells = [].slice.call(row.children)
        cells.forEach(function (cell) {
          const newCell = cell.cloneNode(true)
          newCell.style.width = `${parseInt(
            window.getComputedStyle(cell).width
          )}px`
          newRow.appendChild(newCell)
        })

        newTable.appendChild(newRow)
        item.appendChild(newTable)
        list.appendChild(item)
      })
    }
  }

  const mouseMoveHandler = function (e) {
    if (!isDraggingStarted) {
      isDraggingStarted = true

      cloneTable()

      draggingEle = [].slice.call(list.children)[draggingRowIndex]
      draggingEle.classList.add('dragging')

      // Let the placeholder take the height of dragging element
      // So the next element won't move up
      placeholder = document.createElement('div')
      placeholder.classList.add('placeholder')
      draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling)
      placeholder.style.height = `${draggingEle.offsetHeight}px`
    }

    // Set position for dragging element
    draggingEle.style.position = 'absolute'
    draggingEle.style.top = `${draggingEle.offsetTop + e.clientY - y}px`
    draggingEle.style.left = `${draggingEle.offsetLeft + e.clientX - x}px`

    // Reassign the position of mouse
    x = e.clientX
    y = e.clientY

    // The current order
    // prevEle
    // draggingEle
    // placeholder
    // nextEle
    const prevEle = draggingEle.previousElementSibling
    const nextEle = placeholder.nextElementSibling

    // The dragging element is above the previous element
    // User moves the dragging element to the top
    // We don't allow to drop above the header
    // (which doesn't have `previousElementSibling`)
    if (
      prevEle &&
      prevEle.previousElementSibling &&
      isAbove(draggingEle, prevEle)
    ) {
      // The current order    -> The new order
      // prevEle              -> placeholder
      // draggingEle          -> draggingEle
      // placeholder          -> prevEle
      swap(placeholder, draggingEle)
      swap(placeholder, prevEle)
      return
    }

    // The dragging element is below the next element
    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
      // The current order    -> The new order
      // draggingEle          -> nextEle
      // placeholder          -> placeholder
      // nextEle              -> draggingEle
      swap(nextEle, placeholder)
      swap(nextEle, draggingEle)
    }
  }

  const mouseUpHandler = function () {
    const table = tableRef.current
    // Remove the placeholder
    placeholder && placeholder.parentNode.removeChild(placeholder)

    draggingEle.classList.remove('dragging')
    draggingEle.style.removeProperty('top')
    draggingEle.style.removeProperty('left')
    draggingEle.style.removeProperty('position')

    // Get the end index
    const endRowIndex = [].slice.call(list.children).indexOf(draggingEle)

    isDraggingStarted = false

    // Remove the `list` element
    list.parentNode.removeChild(list)

    // Move the dragged row to `endRowIndex`
    let rows = [].slice.call(table.querySelectorAll('tr'))
    draggingRowIndex > endRowIndex
      ? rows[endRowIndex].parentNode.insertBefore(
          rows[draggingRowIndex],
          rows[endRowIndex]
        )
      : rows[endRowIndex].parentNode.insertBefore(
          rows[draggingRowIndex],
          rows[endRowIndex].nextSibling
        )

    // Bring back the table
    table.style.removeProperty('visibility')

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
  }

  const mouseDownHandler = function (e) {
    const table = tableRef.current
    // Get the original row
    const originalRow = e.target.parentNode
    draggingRowIndex = [].slice
      .call(table.querySelectorAll('tr'))
      .indexOf(originalRow)

    // Determine the mouse position
    x = e.clientX
    y = e.clientY

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
  }
  //move tbody rows end

  const createResizableColumn = function (col, resizer) {
    let xx = 0
    let ww = 0

    const mouseDownHandler = function (e) {
      xx = e.clientX

      const styles = window.getComputedStyle(col)
      ww = parseInt(styles.width, 10)

      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)

      resizer.classList.add('resizing')
    }

    const mouseMoveHandler = function (e) {
      const dx = e.clientX - xx
      col.style.width = `${ww + dx}px`
    }

    const mouseUpHandler = function () {
      resizer.classList.remove('resizing')
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
    }

    resizer.addEventListener('mousedown', mouseDownHandler)
  }

  //sorting start
  const directions =
    tableRef.current &&
    Array.from(tableRef.current.querySelectorAll('th')).map(function (header) {
      const resizer = header.querySelector('.resizer')
      if (!resizerStatus) {
        setResizerStatus(true)
        createResizableColumn(header, resizer)
      }
      resizer.style.height = `${tableRef.current.offsetHeight}px`
      return ''
    })

  const transform = function (index, content) {
    // Get the data type of column
    const type = tableRef.current
      .querySelectorAll('th')
      [index].getAttribute('data-type')
    switch (type) {
      case 'number':
        return parseFloat(content)
      case 'string':
      default:
        return content
    }
  }

  const sortColumn = function (e) {
    e.preventDefault()
    const tableBody = tableRef.current.querySelector('tbody')
    const target = e.target
    let th = target.closest('th')
    let index = th.cellIndex
    // Get the current direction
    const direction = directions[index] || 'asc'

    // A factor based on the direction
    const multiplier = direction === 'asc' ? 1 : -1

    const newRows = Array.from(tableBody.querySelectorAll('tr'))

    newRows.sort(function (rowA, rowB) {
      if (
        rowA.querySelectorAll('td')[index] &&
        rowB.querySelectorAll('td')[index]
      ) {
        const cellA = rowA.querySelectorAll('td')[index].innerHTML
        const cellB = rowB.querySelectorAll('td')[index].innerHTML

        const a = transform(index, cellA)
        const b = transform(index, cellB)

        switch (true) {
          case a > b:
            return 1 * multiplier
          case a < b:
            return -1 * multiplier
          case a === b:
            return 0
        }
      }
    })

    // Remove old rows
    ;[].forEach.call(tableBody.querySelectorAll('tr'), function (row) {
      tableBody.removeChild(row)
    })

    // Reverse the direction
    directions[index] = direction === 'asc' ? 'desc' : 'asc'

    // Append new row
    newRows.forEach(function (newRow) {
      tableBody.appendChild(newRow)
    })
  }
  //sorting end

  const addRowAbove = function (e) {
    console.log(e)
  }

  const addRowBelow = function (e) {
    console.log(e)
  }

  const addNewRow = function (e) {
    e.preventDefault()
    const target = e.target
    const rowIndex = target.parentNode.getAttribute('data-id')
    const tableBody = document.getElementById('tblBody')
    const data = [...lists]
    data[rowIndex] = Object.assign({}, data[rowIndex], {
      [target.getAttribute('data-id')]: target.innerHTML
    })
    if (tableBody.rows.length === target.parentNode.rowIndex) {
      const row = {}
      Object.keys(lists[0]).map((key) => {
        row[key] = ''
      })
      data.push(row)
      setLists(data)
    }
  }

  const addRow = (choice) => (e) => {
    e.preventDefault()
    const target = e.target
    let data = [...lists]
    let newrow = {}
    Object.keys(lists[0]).map((key) => {
      newrow[key] = ''
    })

    switch (choice) {
      case 'above':
        data.splice(currentRow.currentRowIndex, 0, newrow) //insert row in an array
        break
      case 'below':
        data.splice(currentRow.currentRowIndex + 1, 0, newrow)
        break
      default:
        break
    }
    setLists(data)
  }

  const addColumn = (choice) => (e) => {
    e.preventDefault()
    const target = e.target
    let data = [...lists]
    setFieldCount(fieldCount + 1)
    let fieldName = 'field' + fieldCount
    let olddata = JSON.stringify(data)
    let currentField = null
    let selectedField = null
    switch (choice) {
      case 'left':
        currentField =
          tableRef.current.tHead.rows[0].cells[currentRow.currentCellIndex]
        selectedField = currentField.getAttribute('data-id')
        olddata = olddata.replace(
          new RegExp('"' + selectedField + '"', 'g'),
          '"' + fieldName + '":"", "' + selectedField + '"'
        )
        break
      case 'right':
        if (
          currentRow.currentCellIndex ==
          tableRef.current.tHead.rows[0].cells.length - 1
        ) {
          currentField = null
        } else {
          currentField =
            tableRef.current.tHead.rows[0].cells[
              currentRow.currentCellIndex + 1
            ]
        }

        selectedField = currentField && currentField.getAttribute('data-id')
        olddata = olddata.replace(
          new RegExp(currentField ? '"' + selectedField + '"' : '"}', 'g'),
          currentField
            ? '"' + fieldName + '":"", "' + selectedField + '"'
            : '","' + fieldName + '":""}'
        )

        // Object.defineProperty(Object.prototype, 'newField', {
        //   value: true,
        //   writable: true,
        //   configurable: true,
        //   enumerable: true,
        // });
        break
      default:
        break
    }
    data = JSON.parse(olddata)
    setLists(data)
  }
  const deleteRow = function (e) {
    e.preventDefault()
    if (tableRef.current.tBodies[0].rows.length > 1) {
      const target = e.target
      const index = currentRow.currentRowIndex
      const result = [...lists] // make a separate copy of the array
      result.splice(index, 1)
      setLists(result)
    }
  }

  const deleteColumn = function (e) {
    e.preventDefault()
    const cellKey = tableRef.current.tBodies[0].rows[
      currentRow.currentRowIndex
    ].cells[currentRow.currentCellIndex].getAttribute('data-id')
    const data = [...lists]
    data.forEach(function (v) {
      delete v[cellKey]
    })

    setLists(data)
  }

  const handleInputChange = function (e) {
    const target = e.target
    const rowIndex = target.parentNode.getAttribute('data-id')
    const rows = [...lists]
    rows[rowIndex] = Object.assign({}, rows[rowIndex], {
      [target.getAttribute('data-id')]: target.innerHTML
    })
    setLists(rows)
  }

  const loadHeader = () => {
    const table = document.getElementById('resizeMe')
    if (table) {
      var rows =
        lists &&
        Object.keys(lists[0]).map((key, index) => {
          return React.createElement(
            'th',
            {
              'data-id': key,
              contentEditable: true,
              suppressContentEditableWarning: true,
              onClick: (e) => {
                sortColumn(e)
              }
            },
            React.createElement('input', {
              type: 'button',
              value: key
            }),
            React.createElement('div', { className: 'resizer' })
          )
        })
      return (
        <tr>
          <th
            data-type='number'
            onClick={(e) => {
              sortColumn(e)
            }}
          >
            <button>No.</button>
            <div className='resizer' />
          </th>
          {rows}
        </tr>
      )
    }
  }

  const loadDataRows = () => {
    if (lists) {
      const keys = Object.keys(lists[0])
      const keyslength = keys.length - 1
      const rows =
        lists &&
        lists.map((row, index) => {
          let cells = keys.map((key, index) => {
            if (keyslength == index) {
              return (
                <td
                  data-id={key}
                  contentEditable='true'
                  suppressContentEditableWarning='true'
                  onKeyUp={addNewRow}
                >
                  {row[key]}
                </td>
              )
            } else {
              return (
                <td
                  contentEditable='true'
                  suppressContentEditableWarning='true'
                  data-id={key}
                  onKeyUp={handleInputChange}
                >
                  {row[key]}
                </td>
              )
            }
          })

          return (
            <tr key={`row${index}`} data-id={index}>
              <td
                className='draggable'
                onMouseDown={(e) => mouseDownHandler(e)}
              >
                {index + 1}
              </td>
              {cells}
            </tr>
          )
        })
      return rows
    }
  }

  return (
    <div className='py-16 flex items-center justify-center'>
      <table ref={tableRef} key={'resizeMe'} id='resizeMe' className=' table1'>
        <thead key='tblHead'>{loadHeader()}</thead>
        <tbody key='tblBody' id='tblBody'>
          {loadDataRows()}
        </tbody>
      </table>
      <ul className='menu' key='menu'>
        <li className='menu-item menu-item-submenu'>
          <button type='button' className='menu-btn'>
            <i className='fa fa-users' />
            <span className='menu-text'>Add Row</span>
          </button>
          <ul className='menu'>
            <li className='menu-item'>
              <button
                type='button'
                className='menu-btn'
                onClick={addRow('above')}
              >
                <i className='fa fa-folder-open' />
                <span className='menu-text'>Insert Above</span>
              </button>
            </li>
            <li className='menu-item'>
              <button
                type='button'
                className='menu-btn'
                onClick={addRow('below')}
              >
                <i className='fa fa-folder-open' />
                <span className='menu-text'>Insert Below</span>
              </button>
            </li>
          </ul>
        </li>
        <li className='menu-item menu-item-submenu'>
          <button type='button' className='menu-btn'>
            <i className='fa fa-users' />
            <span className='menu-text'>Add Column</span>
          </button>
          <ul className='menu'>
            <li className='menu-item'>
              <button
                type='button'
                className='menu-btn'
                onClick={addColumn('left')}
              >
                <i className='fa fa-folder-open' />
                <span className='menu-text'>Insert Left</span>
              </button>
            </li>
            <li className='menu-item'>
              <button
                type='button'
                className='menu-btn'
                onClick={addColumn('right')}
              >
                <i className='fa fa-folder-open' />
                <span className='menu-text'>Insert Right</span>
              </button>
            </li>
          </ul>
        </li>
        <li className='menu-item menu-item-submenu'>
          <button type='button' className='menu-btn'>
            <i className='fa fa-users' />
            <span className='menu-text'>Delete</span>
          </button>
          <ul className='menu'>
            <li className='menu-item'>
              <button type='button' className='menu-btn' onClick={deleteRow}>
                <i className='fa fa-folder-open' />
                <span className='menu-text'>Delete Row</span>
              </button>
            </li>
            <li className='menu-item'>
              <button type='button' className='menu-btn' onClick={deleteColumn}>
                <i className='fa fa-folder-open' />
                <span className='menu-text'>Delete Column</span>
              </button>
            </li>
          </ul>
        </li>
        <li className='menu-separator' />
        <li className='menu-item'>
          <a href='#' className='menu-btn'>
            <i className='fa fa-folder-open' />
            <span className='menu-text'>Copy</span>
          </a>
        </li>
        <li className='menu-item'>
          <a href='#' className='menu-btn'>
            <i className='fa fa-folder-open' />
            <span className='menu-text'>Cut</span>
          </a>
        </li>
        <li className='menu-item'>
          <a href='#' className='menu-btn'>
            <i className='fa fa-folder-open' />
            <span className='menu-text'>Paste</span>
          </a>
        </li>
      </ul>
    </div>
  )
}

import React, { Fragment } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
//import { loggedInUser } from "../common/DatabaseOperation";
import { Collapse } from 'react-bootstrap'
import { Tabs, Tab } from 'react-bootstrap'
import 'font-awesome/css/font-awesome.min.css'
import toolbar from './toolbar.json'
import fieldProperties from './fieldProperties.json'
import formProperties from './formProperties.json'
import FormFields from './formFields'
import Form from 'react-jsonschema-form'
import { ControlledEditor } from '@monaco-editor/react'
import GridTable from './gridTable'
import 'bootstrap/dist/css/bootstrap.min.css'

export const FormCreator = (props) => {
  //const [show, handleClose, handleShow] = modelFeatures();
  //const user = loggedInUser();
  const refSchema = useRef()
  const refUiSchema = useRef()
  const [fieldPropertiesData] = useState(fieldProperties)
  const [toolbarData] = useState(toolbar)
  const [isOpen, setIsOpen] = useState({
    isFormProperties: false,
    isContorlProperties: true
  })
  const [properties, setProperties] = useState({})
  const [formPropertiesData, setFormPropertiesData] = useState({})
  const [selectedControl, setSelectedControl] = useState('')
  const [propModelInput, setPropModelInput] = useState({
    propName: '',
    propValue: ''
  })
  const [activeTab] = useState('FormDesign')
  const [schema, setSchema] = useState({
    title: 'Form',
    type: 'object',
    required: [],
    properties: {}
  })
  const [formdData] = useState({ text1: 'abc' })
  const [uiSchema, setUiSchema] = useState({})
  const [controlType, setControlType] = useState({})

  useEffect(() => {
    setFormPropertiesData(formProperties)
    // document
    //   .querySelectorAll('#tblControlProperties td')
    //   .forEach(e => e.addEventListener('click', tdDoubleClick));
    // return () => {
    //   document
    //     .querySelectorAll('#tblControlProperties td')
    //     .forEach(e => e.removeEventListener('click', tdDoubleClick));
    // };
  }, [])
  useEffect(() => {}, [refSchema, properties])

  const handleClick = (e) => {
    e.preventDefault()
    if (e) {
      setIsOpen({
        ...isOpen,
        [e.currentTarget.name]: !isOpen[e.currentTarget.name]
      })
    }
  }

  const handleDelete = (e) => {
    // e.preventDefault();
    delete schema.properties[e.currentTarget.name]
    setSchema(schema)
    delete uiSchema[e.currentTarget.name]
    setUiSchema(uiSchema)
  }

  const formEvent = (e) => {
    e.preventDefault()
    setSchema({ ...schema, [e.currentTarget.name]: e.currentTarget.value })
  }

  const addControl = (item) => (e) => {
    e.preventDefault()
    const { name } = e.currentTarget
    // let dataId = e.currentTarget.getAttribute("data-id");
    const incriment = Object.keys(schema.properties).length + 1
    const controlId = name + incriment
    setControlType({ ...controlType, [controlId]: name })
    const schemaTemp = schema
    schemaTemp.properties[controlId] = {
      title: controlId,
      type: item.type
    }
    setSchema(schemaTemp)
    showFieldProperties(name)
    // addControl({
    //   id: incriment,
    //   name: controlId,
    //   typename: name,
    //   title: dataId,
    // });
    setSelectedControl(controlId)
  }

  const showFieldProperties = (name) => {
    const propData = { ...fieldPropertiesData[name] }
    propData.name = name
    propData.required = false
    propData.default = ''
    propData.label = name
    setProperties(propData)
  }

  const itemClickEvent = (e) => {
    let dataId = controlType[e.currentTarget.getAttribute('data-id')]
    setSelectedControl(e.currentTarget.getAttribute('data-id'))
    showFieldProperties(dataId)
  }

  function loadFormroperties() {
    return (
      <>
        <div className='row'>
          <div className='col-10'>
            <h6>Form Properties</h6>
          </div>
          <div className='col-2'>
            <a
              name='isFormProperties'
              href='javascript:void(0);'
              onClick={handleClick}
              aria-controls='formPropertiesDiv'
              aria-expanded={isOpen.isFormProperties}
            >
              <i
                className={
                  isOpen.isFormProperties
                    ? 'fa fa-angle-double-down'
                    : 'fa fa-angle-double-right'
                }
              />
            </a>
          </div>
        </div>
        <Collapse in={isOpen.isFormProperties}>
          <div id='formPropertiesDiv' name='formPropertiesDiv'>
            {/* {controls} */}
            <div className='form-group'>
              <label>Title</label>
              <input
                onChange={formEvent}
                value={schema.title}
                name={'title'}
                className='form-control'
              />
            </div>
            <div className='form-group'>
              <label>Id</label>
              <input
                onChange={formEvent}
                value={schema.id}
                name={'id'}
                className='form-control'
              />
            </div>
            <div className='form-group'>
              <label>Description</label>
              <input
                onChange={formEvent}
                value={schema.description}
                name={'description'}
                className='form-control'
              />
            </div>
            <div className='form-group'>
              <label>Style</label>
              <select className='form-control' name='Style'>
                <option key={0} />
              </select>
            </div>
            <div className='form-group'>
              <label>Columns</label>
              <select className='form-control' name='Columns'>
                <option key={0} />
              </select>
            </div>
            <div className='form-group'>
              <label>Layout</label>
              <select className='form-control' name='layout'>
                <option key={0} />
              </select>
            </div>
          </div>
        </Collapse>
      </>
    )
  }

  const loadToolbarItems = (data) => {
    const toolbarItemdesign =
      data &&
      data.map((item) => {
        return (
          <button
            name={item.name}
            type='button'
            data-id={item.title}
            title={item.tooltip}
            onClick={addControl(item)}
          >
            <i className={item.icon} />
            {item.title}
          </button>
        )
      })
    return toolbarItemdesign
  }

  const loadToolbar = () => {
    const toolbardesign =
      toolbarData &&
      Object.keys(toolbarData).map((bars) => {
        const category = toolbarData[bars]
        return (
          <>
            <div className='row'>
              <div className='col-10'>
                <h6>{category.title}</h6>
              </div>
              <div className='col-2'>
                <a
                  name={category.name}
                  href='javascript:void(0);'
                  onClick={handleClick}
                  aria-controls={category.ariacontrols}
                  aria-expanded={category.ariaexpanded}
                >
                  {category.icon ? (
                    <i
                      className={
                        isOpen[category.name]
                          ? 'fa fa-angle-double-down'
                          : 'fa fa-angle-double-right'
                      }
                    />
                  ) : isOpen[category.name] ? (
                    '+'
                  ) : (
                    '-'
                  )}
                </a>
              </div>
            </div>
            <Collapse
              in={
                isOpen[category.name]
                  ? isOpen[category.name]
                  : category.ariaexpanded
              }
            >
              <div id={category.ariacontrols} name={category.ariacontrols}>
                {loadToolbarItems(category.items)}
              </div>
            </Collapse>
          </>
        )
      })
    return toolbardesign
  }

  // const toParse = (data) => {
  //   try {
  //     return JSON.parse(data);
  //   } catch (error) {
  //     return {};
  //   }
  // };

  const handleFormSchemChange = (ev, value) => {
    try {
      const data = JSON.parse(value)
      setSchema(data)
    } catch (error) {}

    return value
  }

  function handleEditorDidMount(_, editor) {
    refSchema.current = editor
  }

  const handleUiSchemChange = (ev, value) => {
    try {
      const data = JSON.parse(value)
      setUiSchema(data)
    } catch (error) {}
    return value
  }

  function handleUiEditorDidMount(_, editor) {
    refUiSchema.current = editor
  }

  // const onClickTabItem = (e) => {
  //   e.preventDefault();
  //   setActiveTab(e);
  // };

  const handleSave = (e) => {
    e.preventDefault()
    const input = {
      id: 'inv00001',
      title: 'inventorydata',
      description: 'inventorydata',
      definition: {
        formSchema: JSON.stringify(schema.definition.formSchema),
        uiSchema: '{}'
      }
    }
    input.appId = 'a00001'
    input.type = 'form'
    input.author = 'admin'

    // postapi(`/a00001/metadata/form`, input)
    //   .then(function (response) {
    //     if (response.status === 201) {
    //       alert("success");
    //       // props.history.push(
    //       //   `${apiurl}/a00001/creator/${type}/${response.data.id}`,
    //       // );
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //     alert(error);
    //   });
  }

  const tdDoubleClick = (e) => {
    e.preventDefault()
    const target = e.target
    setPropModelInput({
      propName: target.parentNode.cells[0].innerText,
      propValue: target.innerText
    })
    //handleShow();
  }

  const loadDataRows = () => {
    if (properties) {
      //   const keys = Object.keys(properties);
      const rows = Object.keys(properties).map((key) => {
        const value = properties[key].toString()
        return (
          <tr>
            <td>{key}</td>
            <td contentEditable='true' onDoubleClick={tdDoubleClick}>
              {value}
            </td>
          </tr>
        )
      })
      return rows
    }
  }

  // const SaveFieldProperties = (e) => {
  //   const data = { ...properties };
  //   let propName;
  //   let propVal = document.getElementById("propertyValue").value;
  //   if (document.getElementById("ddlpropertylist").value === "Custom") {
  //     propName = document.getElementById("propertyName").value;
  //   } else {
  //     propName = document.getElementById("ddlpropertylist").value;
  //   }
  //   data[propName.toString()] = propVal;
  //   setProperties(data);

  //   // const olduischema = uiSchema;
  //   const oldschema = schema;
  //   const oldcontrol = { ...uiSchema[selectedControl] };
  //   switch (true) {
  //     case ["name"].includes(propName): {
  //       const newControl = (obj) =>
  //         Object.fromEntries(
  //           Object.entries(oldschema.properties).map(([k, v]) => {
  //             if (selectedControl == k) return [propVal, v];
  //             else return [k, v];
  //           })
  //         );

  //       Object.defineProperty(
  //         controlType,
  //         propVal,
  //         Object.getOwnPropertyDescriptor(controlType, selectedControl)
  //       );
  //       oldschema.properties = newControl();
  //       delete controlType[selectedControl];
  //       setControlType(controlType);
  //       setSchema(oldschema);
  //       setSelectedControl(propVal);
  //       break;
  //     }
  //     case ["label"].includes(propName):
  //       {
  //         let properties = schema.properties;
  //         properties[selectedControl].title = propVal;
  //         setSchema({ ...schema, properties: properties });
  //       }
  //       break;
  //     case ["default"].includes(propName): {
  //       let properties = schema.properties;
  //       properties[selectedControl].default = propVal;
  //       setSchema({ ...schema, properties: properties });
  //       break;
  //     }
  //     case ["required"].includes(propName): {
  //       let requiredList = schema["required"];
  //       if (propVal) {
  //         requiredList.push(selectedControl);
  //       } else {
  //         requiredList.splice(requiredList.indexOf(selectedControl), 1);
  //       }
  //       setSchema({ ...schema, required: requiredList });
  //       break;
  //     }
  //     case [
  //       "label",
  //       "accept",
  //       "capture",
  //       "files",
  //       "multiple",
  //       "placeholder",
  //       "className",
  //     ].includes(propName):
  //       setUiSchema({
  //         ...uiSchema,
  //         [selectedControl]: {
  //           "ui:options": { ...oldcontrol["ui:options"], [propName]: propVal },
  //         },
  //       });
  //       break;
  //     case ["readonly", "disabled", "autofocus"].includes(propName):
  //       setUiSchema({
  //         ...uiSchema,
  //         [selectedControl]: {
  //           "ui:options": {
  //             ...oldcontrol["ui:options"],
  //             [propName]: e.currentTarget.checked,
  //           },
  //         },
  //       });
  //       break;
  //     default:
  //       break;
  //   }
  //   //handleClose();
  // };

  // const handleModalInputChange = (e) => {
  //   let propName;
  //   let propVal = document.getElementById("propertyValue").value;
  //   if (document.getElementById("ddlpropertylist").value === "Custom") {
  //     propName = document.getElementById("propertyName").value;
  //   } else {
  //     propName = document.getElementById("ddlpropertylist").value;
  //   }
  //   setPropModelInput({ propName: propName, propValue: propVal });
  // };

  const AddModifyFieldProperties = () => {
    return <></>
    // <Modal show={show} onHide={handleClose}>
    //   <Modal.Header closeButton>
    //     <Modal.Title>Add/Modify Property </Modal.Title>
    //   </Modal.Header>
    //   <Modal.Body>
    //     <div className="input-group mg-b-10 mg-t-10">
    //       <div className="input-group-prepend">
    //         <span className="input-group-text" id="basic-addon1">
    //           Choose Property
    //         </span>
    //       </div>
    //       <select
    //         value={propModelInput.propName}
    //         id="ddlpropertylist"
    //         onChange={(e) => {
    //           e.target.value === "Custom"
    //             ? document
    //                 .querySelector("#divPropertyName")
    //                 .style.removeProperty("display")
    //             : (document.querySelector("#divPropertyName").style.display =
    //                 "none");
    //           handleModalInputChange(e);
    //         }}
    //         className="form-control"
    //         name="parentId"
    //         key={"ddlpropertylist"}
    //       >
    //         <option>name</option>
    //         <option>label</option>
    //         <option>default</option>
    //         <option>required</option>
    //         {Object.keys(properties).map((key) => (
    //           <option value={key}>{key}</option>
    //         ))}
    //         <option>Custom</option>
    //       </select>
    //     </div>

    //     <div
    //       key={"divPropertyName"}
    //       id="divPropertyName"
    //       style={{ display: "none" }}
    //       className="input-group mg-b-10 mg-t-10"
    //     >
    //       <div className="input-group-prepend">
    //         <span className="input-group-text" id="basic-addon1">
    //           Property Name
    //         </span>
    //       </div>
    //       <input
    //         id="propertyName"
    //         type="text"
    //         className="form-control"
    //         placeholder="Property Name"
    //         name="value"
    //         required
    //         type="text"
    //         onChange={handleModalInputChange}
    //       />
    //     </div>
    //     <div className="input-group mg-b-10 mg-t-10">
    //       <div className="input-group-prepend">
    //         <span className="input-group-text" id="basic-addon1">
    //           Value
    //         </span>
    //       </div>
    //       <input
    //         type="text"
    //         id="propertyValue"
    //         className="form-control"
    //         placeholder="Property Value"
    //         name="value"
    //         value={propModelInput.propValue}
    //         onChange={handleModalInputChange}
    //         type="text"
    //       />
    //     </div>
    //   </Modal.Body>
    //   <Modal.Footer>
    //     <button variant="secondary" onClick={handleClose}>
    //       Close
    //     </button>
    //     <button variant="primary" type="button" onClick={SaveFieldProperties}>
    //       Add
    //     </button>
    //   </Modal.Footer>
    // </Modal>
    // );
  }

  const gridTableControl = <GridTable />
  return (
    <Fragment>
      <div className='container-fluid'>
        <button type='button' className='btn btn-icon' onClick={handleSave}>
          Save
        </button>
        <br />
        <div className='row'>
          <div className='col-3'>{loadToolbar()}</div>
          <div className='col-6'>
            <Tabs defaultActiveKey={activeTab} id='FormDesign'>
              <Tab eventKey='FormDesign' key={'FormDesign'} title='Form Design'>
                <FormFields
                  controls={schema.properties}
                  clickevent={handleDelete}
                  itemClickEvent={itemClickEvent}
                />
                <div className='row'>
                  <div className='col-6'>
                    <b> Form Schema</b>
                    <ControlledEditor
                      key={schema}
                      height='60vh'
                      title='formSchemas'
                      theme={'dark'}
                      value={JSON.stringify(schema, null, 3)}
                      onChange={handleFormSchemChange}
                      language='json'
                      editorDidMount={handleEditorDidMount}
                    />
                  </div>
                  <div className='col-6'>
                    <b> Ui Schema</b>
                    <ControlledEditor
                      key={uiSchema}
                      height='60vh'
                      title='uiSchemas'
                      theme={'dark'}
                      value={JSON.stringify(uiSchema, null, 3)}
                      onChange={handleUiSchemChange}
                      language='json'
                      editorDidMount={handleUiEditorDidMount}
                    />
                  </div>
                </div>
              </Tab>
              <Tab
                eventKey='FormPreview'
                key={'FormPreview'}
                title='Form Preview'
              >
                <Form
                  key={'jsonform'}
                  schema={schema}
                  uiSchema={uiSchema}
                  formdData={formdData}
                  onChange={console.log('changed')}
                  onError={console.log('errors')}
                />
              </Tab>
              <Tab eventKey='FormSchema' key='FormSchema' title='Form Schema'>
                {' '}
              </Tab>
            </Tabs>
          </div>
          <div className='col-3'>
            {formPropertiesData && loadFormroperties()}
            {properties && Object.keys(schema.properties).length > 0 && (
              // loadToolbarProperties()
              <>
                <div className='row'>
                  <div className='col-10'>
                    <h6>Field Properties</h6>
                  </div>
                  <div className='col-2'>
                    <a
                      name='isContorlProperties'
                      href='javascript:void(0);'
                      onClick={handleClick}
                      aria-controls='controlPropertiesDiv'
                      aria-expanded={isOpen.isContorlProperties}
                    >
                      <i
                        className={
                          isOpen.isContorlProperties
                            ? 'fa fa-angle-double-down'
                            : 'fa fa-angle-double-right'
                        }
                      />
                    </a>
                  </div>
                </div>
                <Collapse in={isOpen.isContorlProperties}>
                  <div id='controlPropertiesDiv' name='formPropertiesDiv'>
                    <table
                      className='table table-bordered'
                      key={'tblControlProperties'}
                      id='tblControlProperties'
                    >
                      <thead>
                        <tr>
                          <th width={'40%'}>Property</th>
                          <th width={'60%'}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* <tr>
                        <td>name</td>
                        <td onDoubleClick={tdDoubleClick}>{selectedControl}</td>
                      </tr>
                      <tr>
                        <td>label </td>
                        <td
                          onDoubleClick={tdDoubleClick}
                          contentEditable="true"
                        >
                          {(schema &&
                            schema.properties &&
                            schema.properties[selectedControl] &&
                            schema.properties[selectedControl].title) ||
                            ''}
                        </td>
                      </tr>
                      <tr>
                        <td>default</td>
                        <td
                          onDoubleClick={tdDoubleClick}
                          contentEditable="true"
                        >
                          {schema &&
                            schema.properties &&
                            schema.properties[selectedControl] &&
                            schema.properties[selectedControl].defaultValue}
                        </td>
                      </tr>
                      <tr>
                        <td>required </td>
                        <td
                          onDoubleClick={tdDoubleClick}
                          suppressContentEditableWarning="true"
                          contentEditable="true"
                        >
                          {schema['required'] &&
                          schema['required'].indexOf(selectedControl) == -1
                            ? 'false'
                            : 'true'}
                        </td>
                      </tr> */}
                        {loadDataRows()}
                      </tbody>
                    </table>
                  </div>
                </Collapse>
              </>
            )}
          </div>
        </div>
        <div> {gridTableControl}</div> {/* {fieldTable} */}
        {AddModifyFieldProperties()}
      </div>
    </Fragment>
  )
}

// import React, { useState } from "react";
// import { Layout, Modal, Input, Select, Tooltip, message } from "antd";
// import { PlusOutlined, QuestionOutlined } from "@ant-design/icons";
// import Commands from "./Commands.json";
// import Advance from "./Advance";
// import axios from "axios";

// const { Header } = Layout;

// function AppHeader({ onDataAdded }) {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedFields, setSelectedFields] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [selectedLookupOptions, setSelectedLookupOptions] = useState({});
//   const [selectedCommand, setSelectedCommand] = useState(null);

//   const handleChange = (index) => {
//     setSelectedCommand(index);
//     const fields = Commands[index].fields;
//     setSelectedFields(fields);
//     const obj = Object.fromEntries(fields.map((item) => [item.name, ""]));
//     setFormData(obj);
//     setSelectedLookupOptions({});
//   };

//   const InputChange = (name, value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleLookupChange = (fieldName, value, nestedFields = null) => {
//     setSelectedLookupOptions((prev) => ({
//       ...prev,
//       [fieldName]: value,
//     }));
//     setFormData((prev) => {
//       if (nestedFields) {
//         return {
//           ...prev,
//           matchesFields: nestedFields,
//         };
//       }
//       return {
//         ...prev,
//         [fieldName]: value,
//       };
//     });
//   };

//   const NestedFields = (field) => {
//     const selectedOption = field.values.find(
//       (v) => v.option === selectedLookupOptions[field.name]
//     );
//     if (selectedOption?.fields?.length > 0) {
//       return (
//         <div style={{ marginLeft: 30, marginTop: 15 }}>
//           {selectedOption.fields.map((nestedField) => {
//             const handleNestedChange = (value) => {
//               setFormData((prev) => ({
//                 ...prev,
//                 matchesFields: {
//                   ...prev.matchesFields,
//                   [nestedField.name]: value,
//                 },
//               }));
//             };
//             let inputElement;
//             if (nestedField.type === "textarea") {
//               inputElement = (
//                 <Input.TextArea
//                   value={formData.matchesFields?.[nestedField.name] || ""}
//                   onChange={(e) => handleNestedChange(e.target.value)}
//                   placeholder={nestedField.place_holder}
//                 />
//               );
//             } else if (nestedField.type === "checkbox") {
//               inputElement = (
//                 <input
//                   type="checkbox"
//                   checked={formData.matchesFields?.[nestedField.name] || false}
//                   onChange={(e) => handleNestedChange(e.target.checked)}
//                 />
//               );
//             } else {
//               inputElement = (
//                 <Input
//                   placeholder={nestedField.place_holder}
//                   value={formData.matchesFields?.[nestedField.name] || ""}
//                   onChange={(e) => handleNestedChange(e.target.value)}
//                 />
//               );
//             }
//             return (
//               <div key={nestedField.name} style={{ marginBottom: 20 }}>
//                 <label style={{ display: "flex", marginBottom: 5 }}>
//                   {nestedField.label}
//                 </label>
//                 {inputElement}
//               </div>
//             );
//           })}
//         </div>
//       );
//     }

//     return null;
//   };

//   const renderFields = (fields) => {
//     return fields.map((field, index) => {
//       let inputElement;
//       if (field.type === "lookup") {
//         inputElement = (
//           <>
//             <Select
//               placeholder={field.place_holder}
//               style={{ width: "50%" }}
//               value={formData[field.name]}
//               onChange={(value) => handleLookupChange(field.name, value)}
//               options={field.values.map((optionObj) => ({
//                 value: optionObj.option,
//                 label: optionObj.option,
//               }))}
//             />
//             {NestedFields(field)}
//           </>
//         );
//       } else if (field.type === "textarea") {
//         inputElement = (
//           <Input.TextArea
//             value={formData[field.name]}
//             onChange={(e) => InputChange(field.name, e.target.value)}
//             placeholder={field.place_holder}
//           />
//         );
//       } else if (field.type === "checkbox") {
//         inputElement = (
//           <input
//             type="checkbox"
//             checked={formData[field.name]}
//             onChange={(e) => InputChange(field.name, e.target.checked)}
//           />
//         );
//       } else {
//         inputElement = (
//           <Input
//             placeholder={field.place_holder}
//             value={formData[field.name]}
//             onChange={(e) => InputChange(field.name, e.target.value)}
//           />
//         );
//       }
//       return (
//         <div key={index} style={{ marginBottom: 20 }}>
//           <label style={{ display: "flex", marginBottom: 5 }}>
//             {field.label}
//           </label>
//           {inputElement}
//         </div>
//       );
//     });
//   };

//   const handleFormNull = () => {
//     setModalOpen(false);
//     setSelectedFields([]);
//     setFormData({});
//     setSelectedLookupOptions({});
//     setSelectedCommand(null);
//   };

//   const handleAdd = async () => {
//     try {
//       if (selectedCommand === null) {
//         message.error("Please select a command before submitting!");
//         return;
//       }

//       const requiredFields = selectedFields.map((f) => f.name);
//       const emptyFields = requiredFields.filter(
//         (name) =>
//           formData[name] === "" ||
//           formData[name] === undefined ||
//           formData[name] === null
//       );

//       if (emptyFields.length > 0) {
//         message.error("Please fill all required fields before adding!");
//         return;
//       }

//       const { matches, matchesFields, advance, ...restFields } = formData;

//       const dataToSend = {
//         Command: {
//           name: Commands[selectedCommand].name,
//           fields: {
//             matches: {
//               name: matches,
//               fields: matchesFields || {},
//             },
//             ...restFields,
//           },
//           advance: advance || {},
//         },
//       };

//       const response = await axios.post(
//         "http://localhost:3000/api/info/add",
//         dataToSend
//       );

//       console.log("Data inserted:", response.data);
//       message.success("Data inserted successfully!");

//       if (onDataAdded) onDataAdded();

//       handleFormNull();
//     } catch (err) {
//       console.error("Error inserting data:", err);
//       message.error("Error inserting data. Please check your server!");
//     }
//   };

//   return (
//     <>
//       <Header
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           background: "#7b747469",
//           padding: "0 20px",
//           color: "white",
//         }}
//       >
//         <div
//           style={{
//             fontWeight: "bold",
//             fontSize: "40px",
//             color: "black",
//             fontFamily: "sans-serif",
//             letterSpacing: "3px",
//           }}
//         >
//           Task
//         </div>
//         <PlusOutlined
//           style={{
//             fontSize: "22px",
//             color: "black",
//             cursor: "pointer",
//             border: "1px solid",
//             borderRadius: "100px",
//             padding: "5px",
//           }}
//           onClick={() => setModalOpen(true)}
//         />
//       </Header>

//       <Modal
//         title="Add Info"
//         open={modalOpen}
//         onOk={handleAdd}
//         onCancel={handleFormNull}
//         okText="Add"
//         cancelText="Cancel"
//         width={"60%"}
//       >
//         <Select
//           placeholder="Select command"
//           value={selectedCommand}
//           style={{ width: "25%", marginBottom: "30px", marginTop: "20px" }}
//           onChange={(index) => handleChange(Number(index))}
//         >
//           {Commands.map((Command, index) => (
//             <Select.Option key={index} value={index}>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   width: "90%",
//                 }}
//               >
//                 {Command.name}
//                 <Tooltip title={Command.tooltip}>
//                   <QuestionOutlined
//                     style={{ color: "orange", fontWeight: "bold" }}
//                   />
//                 </Tooltip>
//               </div>
//             </Select.Option>
//           ))}
//         </Select>
//         <hr style={{ marginBottom: "20px" }} />
//         {renderFields(selectedFields)}
//         {selectedCommand !== null && <Advance setFormData={setFormData} />}
//       </Modal>
//     </>
//   );
// }

// export default AppHeader;


import React, { useEffect, useState } from "react";
import { Layout, Modal, Input, Select, Tooltip, message } from "antd";
import { PlusOutlined, QuestionOutlined } from "@ant-design/icons";
import Commands from "./Commands.json";
import Advance from "./Advance";
import axios from "axios";

const { Header } = Layout;

function AppHeader({ onDataAdded, editItem, setEditItem }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedLookupOptions, setSelectedLookupOptions] = useState({});
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (editItem) {
      setEditMode(true);
      setModalOpen(true);

      const commandIndex = Commands.findIndex(
        (cmd) => cmd.name === editItem.Command.name
      );
      setSelectedCommand(commandIndex);

      const fields = Commands[commandIndex].fields;
      setSelectedFields(fields);

      const data = editItem.Command.fields || {};
      const filledData = {};

      fields.forEach((f) => {
        if (f.name === "matches") {
          filledData.matches = data.matches?.name || "";
          filledData.matchesFields = data.matches?.fields || {};
          setSelectedLookupOptions({ matches: data.matches?.name || "" });
        } else {
          filledData[f.name] = data[f.name] || "";
        }
      });

      setFormData(filledData);
    }
  }, [editItem]);

  const handleChange = (index) => {
    setSelectedCommand(index);
    const fields = Commands[index].fields;
    setSelectedFields(fields);
    const obj = Object.fromEntries(fields.map((item) => [item.name, ""]));
    setFormData(obj);
    setSelectedLookupOptions({});
  };

  const InputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLookupChange = (fieldName, value, nestedFields = null) => {
    setSelectedLookupOptions((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setFormData((prev) => {
      if (nestedFields) {
        return {
          ...prev,
          matchesFields: nestedFields,
        };
      }
      return {
        ...prev,
        [fieldName]: value,
      };
    });
  };

  const NestedFields = (field) => {
    const selectedOption = field.values.find(
      (v) => v.option === selectedLookupOptions[field.name]
    );
    if (selectedOption?.fields?.length > 0) {
      return (
        <div style={{ marginLeft: 30, marginTop: 15 }}>
          {selectedOption.fields.map((nestedField) => {
            const handleNestedChange = (value) => {
              setFormData((prev) => ({
                ...prev,
                matchesFields: {
                  ...prev.matchesFields,
                  [nestedField.name]: value,
                },
              }));
            };
            let inputElement;
            if (nestedField.type === "textarea") {
              inputElement = (
                <Input.TextArea
                  value={formData.matchesFields?.[nestedField.name] || ""}
                  onChange={(e) => handleNestedChange(e.target.value)}
                  placeholder={nestedField.place_holder}
                />
              );
            } else if (nestedField.type === "checkbox") {
              inputElement = (
                <input
                  type="checkbox"
                  checked={formData.matchesFields?.[nestedField.name] || false}
                  onChange={(e) => handleNestedChange(e.target.checked)}
                />
              );
            } else {
              inputElement = (
                <Input
                  placeholder={nestedField.place_holder}
                  value={formData.matchesFields?.[nestedField.name] || ""}
                  onChange={(e) => handleNestedChange(e.target.value)}
                />
              );
            }
            return (
              <div key={nestedField.name} style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", marginBottom: 5 }}>
                  {nestedField.label}
                </label>
                {inputElement}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderFields = (fields) => {
    return fields.map((field, index) => {
      let inputElement;
      if (field.type === "lookup") {
        inputElement = (
          <>
            <Select
              placeholder={field.place_holder}
              style={{ width: "50%" }}
              value={formData[field.name]}
              onChange={(value) => handleLookupChange(field.name, value)}
              options={field.values.map((optionObj) => ({
                value: optionObj.option,
                label: optionObj.option,
              }))}
            />
            {NestedFields(field)}
          </>
        );
      } else if (field.type === "textarea") {
        inputElement = (
          <Input.TextArea
            value={formData[field.name]}
            onChange={(e) => InputChange(field.name, e.target.value)}
            placeholder={field.place_holder}
          />
        );
      } else if (field.type === "checkbox") {
        inputElement = (
          <input
            type="checkbox"
            checked={formData[field.name]}
            onChange={(e) => InputChange(field.name, e.target.checked)}
          />
        );
      } else {
        inputElement = (
          <Input
            placeholder={field.place_holder}
            value={formData[field.name]}
            onChange={(e) => InputChange(field.name, e.target.value)}
          />
        );
      }
      return (
        <div key={index} style={{ marginBottom: 20 }}>
          <label style={{ display: "flex", marginBottom: 5 }}>
            {field.label}
          </label>
          {inputElement}
        </div>
      );
    });
  };

  const handleFormNull = () => {
    setModalOpen(false);
    setSelectedFields([]);
    setFormData({});
    setSelectedLookupOptions({});
    setSelectedCommand(null);
    setEditMode(false);
    setEditItem(null);
  };

  const handleAddOrUpdate = async () => {
    try {
      if (selectedCommand === null) {
        message.error("Please select a command before submitting!");
        return;
      }

      const requiredFields = selectedFields.map((f) => f.name);
      const emptyFields = requiredFields.filter(
        (name) =>
          formData[name] === "" ||
          formData[name] === undefined ||
          formData[name] === null
      );

      if (emptyFields.length > 0) {
        message.error("Please fill all required fields!");
        return;
      }

      const { matches, matchesFields, advance, ...restFields } = formData;
      const dataToSend = {
        Command: {
          name: Commands[selectedCommand].name,
          fields: {
            matches: {
              name: matches,
              fields: matchesFields || {},
            },
            ...restFields,
          },
          advance: advance || {},
        },
      };

      if (editMode && editItem) {
        await axios.put(
          `http://localhost:3000/api/info/update/${editItem._id}`,
          dataToSend
        );
        message.success("Data updated successfully!");
      } else {
        await axios.post("http://localhost:3000/api/info/add", dataToSend);
        message.success("Data inserted successfully!");
      }

      onDataAdded();
      handleFormNull();
    } catch (err) {
      console.error("Error inserting/updating data:", err);
      message.error("Server error!");
    }
  };

  return (
    <>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#7b747469",
          padding: "0 20px",
          color: "white",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "40px",
            color: "black",
            fontFamily: "sans-serif",
            letterSpacing: "3px",
          }}
        >
          Task
        </div>
        <PlusOutlined
          style={{
            fontSize: "22px",
            color: "black",
            cursor: "pointer",
            border: "1px solid",
            borderRadius: "100px",
            padding: "5px",
          }}
          onClick={() => {
            setEditMode(false);
            setModalOpen(true);
          }}
        />
      </Header>

      <Modal
        title={editMode ? "Edit Info" : "Add Info"}
        open={modalOpen}
        onOk={handleAddOrUpdate}
        onCancel={handleFormNull}
        okText={editMode ? "Update" : "Add"}
        cancelText="Cancel"
        width={"60%"}
      >
        <Select
          placeholder="Select command"
          value={selectedCommand}
          style={{ width: "25%", marginBottom: "30px", marginTop: "20px" }}
          onChange={(index) => handleChange(Number(index))}
        >
          {Commands.map((Command, index) => (
            <Select.Option key={index} value={index}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "90%",
                }}
              >
                {Command.name}
                <Tooltip title={Command.tooltip}>
                  <QuestionOutlined
                    style={{ color: "orange", fontWeight: "bold" }}
                  />
                </Tooltip>
              </div>
            </Select.Option>
          ))}
        </Select>

        <hr style={{ marginBottom: "20px" }} />
        {renderFields(selectedFields)}
        {selectedCommand !== null && <Advance setFormData={setFormData} />}
      </Modal>
    </>
  );
}

export default AppHeader;

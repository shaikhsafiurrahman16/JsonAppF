import React, { useEffect, useState } from "react";
import { Layout, Modal, Input, Select, Tooltip, message } from "antd";
import { PlusOutlined, QuestionOutlined } from "@ant-design/icons";
import Commands from "./Commands.json";
import Advance from "./Advance";
import axios from "axios";

const { Header } = Layout;

function AppHeader({
  onDataAdded,
  editItem,
  setEditItem,
  setModalOpenExternal,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedLookupOptions, setSelectedLookupOptions] = useState({});
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState(null);

  // External open modal for row insert
  useEffect(() => {
    if (setModalOpenExternal) {
      setModalOpenExternal(() => (index = null) => {
        setInsertAfterIndex(index); // clicked row index
        setEditMode(false);
        setModalOpen(true);
      });
    }
  }, [setModalOpenExternal]);

  // Build data object for API
  const buildCommandData = (commandName, formData) => {
    const { matches, matchesFields, option, advance, ...rest } = formData;
    let nestedField = {};

    if (matches && matchesFields && Object.keys(matchesFields).length > 0) {
      nestedField = { [matches]: { ...matchesFields } };
    } else if (
      option &&
      matchesFields &&
      Object.keys(matchesFields).length > 0
    ) {
      nestedField = { [option]: { ...matchesFields } };
    }

    const finalFields = { ...nestedField, ...rest };
    return {
      [commandName]: {
        fields: finalFields,
        advance: advance || {},
      },
    };
  };

  // Pre-fill data for edit
  useEffect(() => {
    if (!editItem) return;

    setEditMode(true);
    setModalOpen(true);

    const commandKey = Object.keys(editItem).find((key) => key !== "_id");
    if (!commandKey) return;

    const commandIndex = Commands.findIndex((cmd) => cmd.name === commandKey);
    if (commandIndex === -1) return;

    setSelectedCommand(commandIndex);
    setSelectedFields(Commands[commandIndex].fields);

    const data = editItem[commandKey]?.fields || {};
    const filledData = {};

    Commands[commandIndex].fields.forEach((f) => {
      if (f.name === "matches") {
        const matchKey = Object.keys(data).find(
          (k) => typeof data[k] === "object"
        );
        filledData.matches = matchKey || "";
        filledData.matchesFields = matchKey ? data[matchKey] : {};
        setSelectedLookupOptions({ matches: matchKey || "" });
      } else if (f.name === "option") {
        const optKey = Object.keys(data).find(
          (k) => typeof data[k] === "object"
        );
        filledData.option = optKey || "";
        filledData.matchesFields = optKey ? data[optKey] : {};
        setSelectedLookupOptions({ option: optKey || "" });
      } else {
        filledData[f.name] = data[f.name] || "";
      }
    });

    setFormData(filledData);
  }, [editItem]);

  const handleChange = (index) => {
    setSelectedCommand(index);
    console.log(setSelectedCommand(index))
    const fields = Commands[index].fields;
    setSelectedFields(fields);
    setFormData(Object.fromEntries(fields.map((f) => [f.name, ""])));
    setSelectedLookupOptions({});
    if (!editMode) setEditItem(null);
  };

  const InputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookupChange = (fieldName, value, nestedFields = null) => {
    setSelectedLookupOptions((prev) => ({ ...prev, [fieldName]: value }));
    setFormData((prev) => {
      if (nestedFields) return { ...prev, matchesFields: nestedFields };
      return { ...prev, [fieldName]: value };
    });
  };

  const NestedFields = (field) => {
    const selectedOption = field.values?.find(
      (v) => v.option === selectedLookupOptions[field.name]
    );

    if (!selectedOption?.fields?.length) return null;

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
  };

  const renderFields = (fields) =>
    fields.map((field, index) => {
      let inputElement;

      if (field.type === "lookup") {
        inputElement = (
          <>
            <Select
              placeholder={field.place_holder}
              style={{ width: "50%" }}
              value={formData[field.name]}
              onChange={(value) => handleLookupChange(field.name, value)}
              options={field.values.map((opt) => ({
                value: opt.option,
                label: opt.option,
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

  const handleFormNull = () => {
    setModalOpen(false);
    setSelectedFields([]);
    setFormData({});
    setSelectedLookupOptions({});
    setSelectedCommand(null);
    setEditMode(false);
    setEditItem(null);
    setInsertAfterIndex(null);
  };

  const handleAddOrUpdate = async () => {
    try {
      if (selectedCommand === null) {
        message.error("Please select a command before submitting");
        return;
      }

      const commandName = Commands[selectedCommand].name;
      const dataToSend = buildCommandData(commandName, formData);

      if (editMode && editItem?._id) {
        await axios.put(
          `http://localhost:3000/api/info/update/${editItem._id}`,
          dataToSend
        );
        message.success("Data updated successfully!");
      } else {
        await axios.post("http://localhost:3000/api/info/add", dataToSend);
        message.success("Data added successfully");
      }

      if (typeof window.addRowBelow === "function") {
        window.addRowBelow(insertAfterIndex);
      }
      onDataAdded(insertAfterIndex);
      handleFormNull();
    } catch (err) {
      console.error(err);
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
            setInsertAfterIndex(null); // add at end
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

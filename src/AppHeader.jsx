import React, { useEffect, useState } from "react";
import { Layout, Modal, Input, Select, Tooltip, message } from "antd";
import { PlusOutlined, QuestionOutlined } from "@ant-design/icons";
import axios from "axios";
import Commands from "./Commands.json";
import Advance from "./Advance";

const { Header } = Layout;

function AppHeader({
  onDataAdded,
  editItem,
  setEditItem,
  setModalOpenExternal,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [formData, setFormData] = useState({});
  const [lookupOptions, setLookupOptions] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState(null);

  const resetForm = () => {
    setModalOpen(false);
    setSelectedCommand(null);
    setFormData({});
    setLookupOptions({});
    setEditMode(false);
    setEditItem(null);
    setInsertAfterIndex(null);
  };

  useEffect(() => {
    if (setModalOpenExternal) {
      setModalOpenExternal(() => (index = null) => {
        setInsertAfterIndex(index);
        setEditMode(false);
        setModalOpen(true);
      });
    }
  }, [setModalOpenExternal]);

  const buildData = (cmdName, data) => {
    const { matches, matchesFields, option, advance, ...rest } = data;
    let nested = {};

    if (matches && matchesFields && Object.keys(matchesFields).length)
      nested = { [matches]: { ...matchesFields } };
    else if (option && matchesFields && Object.keys(matchesFields).length)
      nested = { [option]: { ...matchesFields } };

    return {
      [cmdName]: {
        fields: { ...nested, ...rest },
        advance: advance || {},
      },
    };
  };

  useEffect(() => {
    if (!editItem) return;
    setEditMode(true);
    setModalOpen(true);

    const cmdName = Object.keys(editItem).find((k) => k !== "_id");
    const cmdIndex = Commands.findIndex((c) => c.name === cmdName);
    if (cmdIndex === -1) return;

    setSelectedCommand(cmdIndex);
    const fields = Commands[cmdIndex].fields;
    const data = editItem[cmdName]?.fields || {};
    const filled = {};

    fields.forEach((f) => {
      const key = Object.keys(data).find((k) => typeof data[k] === "object");
      if (f.type === "lookup") {
        filled[f.name] = key || "";
        filled.matchesFields = key ? data[key] : {};
        setLookupOptions({ [f.name]: key || "" });
      } else {
        filled[f.name] = data[f.name] || "";
      }
    });
    setFormData(filled);
  }, [editItem]);

  const handleCommandSelect = (index) => {
    setSelectedCommand(index);
    const fields = Commands[index].fields;
    const initialData = {};
    const initialLookup = {};

    fields.forEach((f) => {
      if (f.type === "lookup") {
        const defaultSelected = f.selected || "";
        initialData[f.name] = defaultSelected;
        initialLookup[f.name] = defaultSelected;
      } else if (f.type === "checkbox") {
        initialData[f.name] = f.value || false;
      } else {
        initialData[f.name] = f.value || "";
      }
    });

    setFormData(initialData);
    setLookupOptions(initialLookup);
    if (!editMode) setEditItem(null);
  };

  const handleChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleLookup = (field, value, nested = null) => {
    setLookupOptions((prev) => ({ ...prev, [field]: value }));
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(nested && { matchesFields: nested }),
    }));
  };

  const renderNested = (field) => {
    const selected = field.values?.find(
      (v) => v.option === lookupOptions[field.name]
    );
    if (!selected?.fields?.length) return null;

    return (
      <div style={{ marginLeft: 30, marginTop: 15 }}>
        {selected.fields.map((nested) => (
          <div key={nested.name} style={{ marginBottom: 20 }}>
            <label>{nested.label}</label>
            <Input
              placeholder={nested.place_holder}
              value={formData.matchesFields?.[nested.name] || ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  matchesFields: {
                    ...p.matchesFields,
                    [nested.name]: e.target.value,
                  },
                }))
              }
            />
          </div>
        ))}
      </div>
    );
  };

  const renderFields = (fields) =>
    fields.map((f, i) => (
      <div key={i} style={{ marginBottom: 20 }}>
        <label>{f.label}</label>
        {f.type === "lookup" ? (
          <>
            <Select
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: "50%" }}
              value={formData[f.name]}
              placeholder={f.place_holder}
              onChange={(val) => handleLookup(f.name, val)}
              options={f.values.map((opt) => ({
                value: opt.option,
                label: opt.option,
              }))}
            />
            {renderNested(f)}
          </>
        ) : f.type === "textarea" ? (
          <Input.TextArea
            value={formData[f.name]}
            placeholder={f.place_holder}
            onChange={(e) => handleChange(f.name, e.target.value)}
          />
        ) : f.type === "checkbox" ? (
          <input
            type="checkbox"
            checked={formData[f.name]}
            onChange={(e) => handleChange(f.name, e.target.checked)}
          />
        ) : (
          <Input
            value={formData[f.name]}
            placeholder={f.place_holder}
            onChange={(e) => handleChange(f.name, e.target.value)}
          />
        )}
      </div>
    ));

  const handleSubmit = async () => {
    try {
      if (selectedCommand === null)
        return message.error("Please select a command");

      const cmdName = Commands[selectedCommand].name;
      const data = buildData(cmdName, formData);

      if (editMode && editItem?._id) {
        await axios.put(
          `http://localhost:3000/api/info/update/${editItem._id}`,
          data
        );
        message.success("Data updated successfully!");
      } else {
        await axios.post("http://localhost:3000/api/info/add", data);
        message.success("Data added successfully!");
      }

      if (typeof window.addRowBelow === "function")
        window.addRowBelow(insertAfterIndex);
      onDataAdded(insertAfterIndex);
      resetForm();
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
        <div style={{ fontWeight: "bold", fontSize: "40px", color: "black" }}>
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
            setInsertAfterIndex(null);
            setModalOpen(true);
            setSelectedCommand(null);
            setFormData({});
          }}
        />
      </Header>

      <Modal
        title={editMode ? "Edit Info" : "Add Info"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        okText={editMode ? "Update" : "Add"}
        cancelText="Cancel"
        width={"60%"}
      >
        <Select
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Select command"
          value={selectedCommand}
          style={{ width: "25%", marginBottom: "30px", marginTop: "20px" }}
          onChange={(i) => handleCommandSelect(Number(i))}
        >
          {Commands.map((cmd, i) => (
            <Select.Option key={i} value={i} label={cmd.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "90%",
                }}
              >
                {cmd.name}
                <Tooltip title={cmd.tooltip}>
                  <QuestionOutlined style={{ color: "orange" }} />
                </Tooltip>
              </div>
            </Select.Option>
          ))}
        </Select>

        <hr style={{ marginBottom: "20px" }} />
        {selectedCommand !== null && (
          <>
            {renderFields(Commands[selectedCommand].fields)}
            <Advance setFormData={setFormData} />
          </>
        )}
      </Modal>
    </>
  );
}

export default AppHeader;

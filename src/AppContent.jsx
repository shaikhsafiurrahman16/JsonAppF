import React, { useEffect, useState } from "react";
import { List, Tooltip, Popconfirm, message, Modal, Button } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";

function AppContent({ refreshTrigger, setEditItem, openAddModal }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const { data: res } = await axios.get(
        "http://localhost:3000/api/info/all"
      );
      setData(res.data || []);
    } catch {
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const formatCommandView = (item) => {
    const commandKey = Object.keys(item).find(
      (k) => k !== "_id" && k !== "order"
    );
    if (!commandKey) return {};
    const cmdData = item[commandKey]?.fields || {};
    const advance = item[commandKey]?.advance || {};
    const conditionKey = Object.keys(cmdData).find(
      (k) => typeof cmdData[k] === "object" && cmdData[k] !== null
    );
    const conditionFields = conditionKey ? cmdData[conditionKey] : null;
    const formatted = {
      command: commandKey,
    };
    if (item._id) {
      formatted._id =
        typeof item._id === "object" && item._id.$oid
          ? item._id.$oid
          : item._id;
    }
    if (item.order !== undefined) {
      formatted.order = item.order;
    }
    if (cmdData.name) formatted.name = cmdData.name;
    if (cmdData.css || cmdData.css_path)
      formatted.css_path = cmdData.css || cmdData.css_path;
    if (cmdData.value) formatted.value = cmdData.value;
    if (cmdData.desc) formatted.desc = cmdData.desc;
    if (cmdData.target) formatted.target = cmdData.target;
    if (cmdData.description) formatted.description = cmdData.description;
    if (conditionKey) {
      formatted.condition = conditionKey;
      if (conditionFields && typeof conditionFields === "object") {
        Object.entries(conditionFields).forEach(([key, value]) => {
          formatted[key] = value;
        });
      }
    }
    if (advance && Object.keys(advance).length > 0) {
      formatted.advance = advance;
    }

    return formatted;
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/info/delete/${id}`);
      message.success("Deleted successfully!");
      fetchData();
    } catch {
      message.error("Failed to delete item");
    }
  };

  const handleAddNewRow = (index) => {
    const newItem = {
      _id: `temp-${Date.now()}`,
      temp: true,
      NewRow: { fields: {} },
    };
    const updated = [...data];
    updated.splice(index + 1, 0, newItem);
    setData(updated);
  };

  useEffect(() => {
    window.addRowBelow = handleAddNewRow;
  }, [data]);

  const handleDragEnd = async ({ source, destination }) => {
    if (!destination) return;
    const updated = Array.from(data);
    const [moved] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, moved);
    setData(updated);
    try {
      await axios.put("http://localhost:3000/api/info/reorder", {
        orderedIds: updated.map((i) => i._id),
      });
    } catch {
      message.error("Order update failed");
    }
  };

  const ActionIcon = ({ title, icon, onClick, color }) => (
    <Tooltip title={title}>
      {React.cloneElement(icon, { onClick, style: { color, fontSize: 18 } })}
    </Tooltip>
  );

  return (
    <div style={{ padding: 20 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="infoList">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <List
                loading={loading}
                dataSource={data}
                renderItem={(item, index) => {
                  const cmd =
                    Object.keys(item).find((k) => k !== "_id") ||
                    "Unknown Command";
                  return (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={index}
                    >
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          style={{
                            marginBottom: 8,
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            padding: "10px 15px",
                            background: snap.isDragging ? "#f0f9ff" : "#fff",
                            boxShadow: snap.isDragging
                              ? "0 0 8px rgba(24,144,255,0.3)"
                              : "none",
                            ...prov.draggableProps.style,
                          }}
                        >
                          <List.Item
                            actions={[
                              <ActionIcon
                                key="view"
                                title="View"
                                icon={<EyeOutlined />}
                                color="#1890ff"
                                onClick={() => {
                                  const formatted = formatCommandView(item);
                                  setSelectedItem(formatted);
                                  setModalOpen(true);
                                }}
                              />,
                              <ActionIcon
                                key="edit"
                                title="Edit"
                                icon={<EditOutlined />}
                                color="#52c41a"
                                onClick={() => setEditItem(item)}
                              />,
                              <ActionIcon
                                key="add"
                                title="Add New Below"
                                icon={<PlusOutlined />}
                                color="#722ed1"
                                onClick={() => openAddModal?.(index)}
                              />,
                              <Popconfirm
                                key="delete"
                                title="Delete this item?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDelete(item._id)}
                              >
                                <ActionIcon
                                  title="Delete"
                                  icon={<DeleteOutlined />}
                                  color="red"
                                />
                              </Popconfirm>,
                            ]}
                          >
                            <strong>
                              {item.temp ? "New Row (unsaved)" : cmd}
                            </strong>
                          </List.Item>
                        </div>
                      )}
                    </Draggable>
                  );
                }}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        title="Alert Details"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
      >
        {selectedItem ? (
          <pre
            style={{
              background: "#f5f5f5",
              padding: 10,
              borderRadius: 6,
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            {JSON.stringify(selectedItem, null, 2)}
          </pre>
        ) : (
          <p>No data available</p>
        )}
      </Modal>
    </div>
  );
}

export default AppContent;


import React, { useEffect, useState } from "react";
import { List, Modal, Button, Tooltip, Popconfirm, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function AppContent({ refreshTrigger, setEditItem }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/info/all");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/info/delete/${id}`);
      message.success("Deleted successfully!");
      fetchData();
    } catch (error) {
      message.error("Failed to delete item!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <DragDropContext
        onDragEnd={async (r) => {
          if (!r.destination) return;
          const items = Array.from(data);
          const [moved] = items.splice(r.source.index, 1);
          items.splice(r.destination.index, 0, moved);
          setData(items);
          try {
            await axios.put("http://localhost:3000/api/info/reorder", {
              orderedIds: items.map((i) => i._id),
            });
          } catch {
            message.error("Order update failed");
          }
        }}
      >
        <Droppable droppableId="infoList">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <List
                loading={loading}
                dataSource={data}
                renderItem={(item, index) => {
                  const commandName =
                    Object.keys(item).find((key) => key !== "_id") ||
                    "Unknown Command";

                  return (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: snapshot.isDragging
                              ? "#f0f9ff"
                              : "#fff",
                            marginBottom: 8,
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            boxShadow: snapshot.isDragging
                              ? "0 0 8px rgba(24,144,255,0.3)"
                              : "none",
                            transition: "all 0.2s ease",
                            padding: "10px 15px",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <List.Item
                            actions={[
                              <Tooltip title="View" key="view">
                                <EyeOutlined
                                  style={{ color: "#1890ff", fontSize: 18 }}
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setModalOpen(true);
                                  }}
                                />
                              </Tooltip>,
                              <Tooltip title="Edit" key="edit">
                                <EditOutlined
                                  style={{ color: "#52c41a", fontSize: 18 }}
                                  onClick={() => setEditItem(item)}
                                />
                              </Tooltip>,
                              <Popconfirm
                                key="delete"
                                title="Delete this item?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDelete(item._id)}
                              >
                                <Tooltip title="Delete">
                                  <DeleteOutlined
                                    style={{ color: "red", fontSize: 18 }}
                                  />
                                </Tooltip>
                              </Popconfirm>,
                            ]}
                          >
                            <strong>{commandName}</strong>
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

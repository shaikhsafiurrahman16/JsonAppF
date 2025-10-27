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
      setData(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleView = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/info/delete/${id}`);
      message.success("Deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error("Failed to delete item!");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newData = Array.from(data);
    const [movedItem] = newData.splice(result.source.index, 1);
    newData.splice(result.destination.index, 0, movedItem);
    setData(newData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="infoList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <List
                loading={loading}
                dataSource={data}
                renderItem={(item, index) => (
                  console.log(item),
                  (
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
                            marginBottom: "8px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            boxShadow: snapshot.isDragging
                              ? "0 0 10px rgba(24,144,255,0.3)"
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
                                  onClick={() => handleView(item)}
                                  style={{
                                    color: "#1890ff",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>,
                              <Tooltip title="Edit" key="edit">
                                <EditOutlined
                                  style={{
                                    color: "#52c41a",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setEditItem(item);
                                  }}
                                />
                              </Tooltip>,

                              <Popconfirm
                                key="delete"
                                title="Are you sure you want to delete this item?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => handleDelete(item._id)}
                              >
                                <Tooltip title="Delete">
                                  <DeleteOutlined
                                    style={{
                                      color: "red",
                                      fontSize: "18px",
                                      cursor: "pointer",
                                    }}
                                  />
                                </Tooltip>
                              </Popconfirm>,
                            ]}
                          >
                            <strong>
                              {Object.keys(item).find((key) => key !== "_id") ||
                                "Unknown Command"}
                            </strong>
                          </List.Item>
                        </div>
                      )}
                    </Draggable>
                  )
                )}
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
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedItem ? (
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "6px",
              maxHeight: "400px",
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

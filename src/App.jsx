import AppContent from "./AppContent";
import AppHeader from "./AppHeader";
import "../src/My.css";
import { useState } from "react";
function App() {
  const [dataUpdated, setDataUpdated] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(() => () => {});

  const toggleUpdate = () => setDataUpdated((prev) => !prev);

  return (
    <>
      <AppHeader
        onDataAdded={toggleUpdate}
        editItem={editItem}
        setEditItem={setEditItem}
        setModalOpenExternal={setOpenAddModal}
      />
      <AppContent
        refreshTrigger={dataUpdated}
        setEditItem={setEditItem}
        openAddModal={openAddModal}
      />
    </>
  );
}

export default App;

// import { useState } from "react";
// import AppContent from "./AppContent";
// import AppHeader from "./AppHeader";
// import "../src/My.css"

// function App() {
//   const [dataUpdated, setDataUpdated] = useState(false);

//   const handleDataAdded = () => {
//     setDataUpdated((prev) => !prev);
//   };

//   return (
//     <>
//       <AppHeader onDataAdded={handleDataAdded} />
//       <AppContent refreshTrigger={dataUpdated} />
//     </>
//   );
// } 

// export default App;


import AppContent from "./AppContent";
import AppHeader from "./AppHeader";
import "../src/My.css";
import { useState } from "react";

function App() {
  const [dataUpdated, setDataUpdated] = useState(false);
  const [editItem, setEditItem] = useState(null); // 🔹 yeh store karega jo edit ho raha hai

  const toggleUpdate = () => setDataUpdated((prev) => !prev);

  return (
    <>
      <AppHeader onDataAdded={toggleUpdate} editItem={editItem} setEditItem={setEditItem} />
      <AppContent refreshTrigger={dataUpdated} setEditItem={setEditItem} />
    </>
  );
}

export default App;

import React from "react"
import { Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import DropZonePage from "@/components/pages/DropZonePage"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DropZonePage />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="toast-container"
        style={{ zIndex: 9999 }}
      />
    </>
  )
}

export default App
"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer 
      position="bottom-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={true}
      pauseOnHover={false}
      theme="light"
      style={{
        fontSize: '14px'
      }}
      toastStyle={{
        backgroundColor: '#5A1E12',
        color: '#EAD7B7',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #803512',
        minHeight: '60px'
      }}
      progressClassName="!bg-[#EAD7B7]"
    />
  );
}

import React, { useState, useEffect } from "react";

export default function PopupDeleteGroup({ onClose, onConfirm }) {
  const [randomCode, setRandomCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState("");

  // Hàm sinh chuỗi ngẫu nhiên gồm 6 ký tự chữ cái
  const generateRandomCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // gồm cả hoa và thường
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  };

  useEffect(() => {
    setRandomCode(generateRandomCode());
  }, []);

  const handleConfirm = () => {
    if (!userInput.trim()) {
      setError("Please enter the code.");
      return;
    }

    if (userInput === randomCode) {
      onConfirm();
    } else {
      setError("The code you entered is incorrect.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 mt-10">
      <div className="popup-delete-service-container w-[450px] h-auto bg-white px-4 py-6 rounded-md shadow-lg">
        <div className="header-popup">
          <div className="flex flex-row justify-between items-center">
            <div className="popup-title font-semibold text-[20px]">Delete group</div>
            <i className="fa-solid fa-xmark cursor-pointer" onClick={onClose}></i>
          </div>
          <div className="border-t border-gray-300 mt-3"></div>
        </div>

        <div className="body-popup mt-5 text-left">
          <p>To confirm deletion, please type the code below:</p>
          <p className="font-bold text-lg mt-2 text-red-600 tracking-widest">{randomCode}</p>

          <input
            type="text"
            className="mt-3 w-full p-2 border border-gray-400 rounded"
            placeholder="Enter the code here"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="footer-popup mt-6 text-end flex justify-end gap-3">
          <button
            className="bg-purple-400 text-white px-4 py-2 rounded hover:bg-purple-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={handleConfirm}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
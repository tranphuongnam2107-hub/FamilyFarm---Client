import React from "react";

export default function PopupToggleService({ onClose, onConfirm, isDisabling }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 mt-10">
      <div className="w-[450px] h-[200px] bg-white px-3 py-2 rounded-md shadow-lg">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-[24px]">
            {isDisabling ? "Disable Service" : "Enable Service"}
          </div>
          <i className="fa-solid fa-xmark cursor-pointer" onClick={onClose}></i>
        </div>
        <div className="border border-gray-400 my-2"></div>
        <div className="mt-4 text-center text-[16px]">
          Are you sure you want to {isDisabling ? "disable" : "enable"} this service?
        </div>
        <div className="mt-10 flex justify-end gap-3">
          <button
            className={`px-5 py-2 font-semibold text-white ${isDisabling ? "bg-red-600" : "bg-green-600"}`}
            onClick={onConfirm}
          >
            {isDisabling ? "Disable" : "Enable"}
          </button>
          <button className="px-5 py-2 font-semibold bg-gray-400 text-white" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

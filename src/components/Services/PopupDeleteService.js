import React from "react";

export default function PopupDeleteService ({ onClose, onConfirm }) {
    return(
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 mt-10">
      <div className="popup-delete-service-container w-[450px] h-[200px] bg-white px-3 py-2 rounded-md shadow-[0px_0px_17px_0px_rgba(66,68,90,1)]">
        <div className="header-popup">
          <div className="flex flex-row justify-between items-center">
            <div className="popup-title font-semibold font-roboto text-[24px]">
              Delete service
            </div>
            <i
              className="fa-solid fa-xmark cursor-pointer"
              onClick={onClose}
            ></i>
          </div>
          <div className="border border-solid border-gray-600"></div>
        </div>
        <div className="body-popup mt-4">
          <div>Are you sure you want to delete?</div>
        </div>
        <div className="footer-popup mt-10 text-end">
          <div className="flex flex-row gap-3 justify-end">
            <button
              className="bg-red-700 text-white px-5 py-2 font-roboto font-semibold cursor-pointer"
              onClick={onConfirm}
            >
              Delete
            </button>
            <button
              className="bg-purple-400 text-white px-5 py-2 font-roboto font-semibold cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    );
}
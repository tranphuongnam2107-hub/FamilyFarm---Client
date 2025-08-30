// FileReview.js — dùng react‑pdf, nhận sẵn mime từ prop
import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Chỉ định worker PDF.js lấy từ CDN – luôn khớp version
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const FileReview = ({ url, mime, onClose }) => {
  if (!url || !mime) return null;

  const isImage = mime.startsWith("image/");
  const isPDF = mime === "application/pdf";
  const isWord =
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto relative">
        <button
          className="absolute top-2 right-3 text-red-500 font-bold text-lg"
          onClick={onClose}
        >
          ×
        </button>

        {/* Ảnh */}
        {isImage && (
          <img
            src={url}
            alt="certificate"
            className="max-w-full max-h-[80vh] object-contain mx-auto"
          />
        )}

        {/* PDF */}
        {isPDF && (
          <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
              url
            )}`}
            width="100%"
            height="600px"
            title="PDF Viewer"
            style={{ border: "none" }}
          />
        )}

        {/* Word */}
        {isWord && (
          <iframe
            src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
              url
            )}`}
            title="Word Viewer"
            width="100%"
            height="500px"
            style={{ border: "none" }}
          />
        )}

        {!isImage && !isPDF && !isWord && (
          <p className="text-center text-red-500 font-semibold">
            Cannot preview this file type.
          </p>
        )}
      </div>
    </div>
  );
};

export default FileReview;

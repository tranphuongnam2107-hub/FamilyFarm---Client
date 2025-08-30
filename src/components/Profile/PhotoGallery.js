import React from "react";
import PhotoItem from "./PhotoItem";
import { Link } from "react-router-dom";

const PhotoGallery = ({ photos, isOwner, accId }) => {
  const photoList = photos || [];

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold mb-3">Photos ({photoList.length})</h2>
        {isOwner === true ? (
          <Link className="text-blue-800" to="/UserPhotos">
            See all
          </Link>
        ) : (
          <Link className="text-blue-800" to={`/UserPhotos/${accId}`}>
            See all
          </Link>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {photoList.slice(0, 9).map((photo, index) => {
          // Nếu là ảnh thứ 9 và còn nhiều ảnh hơn => overlay "+X more"
          if (index === 8 && photoList.length > 9) {
            const moreCount = photoList.length - 9;
            return (
              <div key={index} className="relative">
                <PhotoItem photo={photo} />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-xl font-bold rounded-md">
                  +{moreCount} more
                </div>
              </div>
            );
          }

          return <PhotoItem key={index} photo={photo} />;
        })}
      </div>
    </div>
  );
};

export default PhotoGallery;

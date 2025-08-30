import React from "react";

const PhotoItem = ({ photo }) => {
    const defaultPhoto = {
        src: "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/02/minecraft-key-art-feature.jpg",
        alt: "Photo",
    };
    const photoData = { ...defaultPhoto, ...photo };

    return (
        <img
            src={photo ||'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/02/minecraft-key-art-feature.jpg'}
            alt={photo}
            className="w-full h-20 object-cover rounded-md"
        />
    );
};

export default PhotoItem;
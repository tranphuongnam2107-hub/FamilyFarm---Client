import { useState, useRef } from "react";

const useImage = (initialImage) => {
  const [image, setImage] = useState(initialImage);
  const [showPopup, setShowPopup] = useState(false);
  const inputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setShowPopup(false);
    }
  };

  const triggerFileInput = () => {
    inputRef.current.click();
  };

  return {
    image,
    setImage,
    showPopup,
    setShowPopup,
    inputRef,
    handleImageChange,
    triggerFileInput,
  };
};

export default useImage;
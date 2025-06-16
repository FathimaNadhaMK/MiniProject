import React, { useState } from "react";

function Advertise() {
  const [adText, setAdText] = useState("");

  const saveAdToLocalStorage = (media, mediaType) => {
    const newAd = { media, mediaType };
    const existingAds = JSON.parse(localStorage.getItem("adList")) || [];

    // Add new ad at the beginning
    const updatedAds = [newAd, ...existingAds];

    localStorage.setItem("adList", JSON.stringify(updatedAds));
    alert("✅ Ad saved successfully!");
  };

  const handleAdUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result;
        const fileType = file.type.startsWith("video") ? "video" : "image";
        saveAdToLocalStorage(base64Data, fileType);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleTextSubmit = () => {
    if (adText.trim() !== "") {
      saveAdToLocalStorage(adText.trim(), "text");
      setAdText("");
    } else {
      alert("❗ Please enter some text.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Advertisement</h2>

      <div style={{ marginBottom: "20px" }}>
        <label><strong>Image or Video Ad:</strong></label>
        <input type="file" accept="image/*,video/*" onChange={handleAdUpload} />
      </div>

      <div>
        <label><strong>Text Ad:</strong></label>
        <textarea
          rows="4"
          cols="50"
          placeholder="Enter text advertisement here..."
          value={adText}
          onChange={(e) => setAdText(e.target.value)}
        />
        <br />
        <button onClick={handleTextSubmit}>Submit Text Ad</button>
      </div>
    </div>
  );
}

export default Advertise;

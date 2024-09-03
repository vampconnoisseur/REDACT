"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ValidateMaskedElement = () => {
  const [elementType, setElementType] = useState("");
  const [element, setElement] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [validationResult, setValidationResult] = useState("");

  const handleElementTypeChange = (e) => {
    setElementType(e.target.value);
    setElement(null);
    setPreview("");
    setFileUrl("");
    setValidationResult("");
  };

  const handleElementChange = (e) => {
    const selectedElement = e.target.files[0];
    if (selectedElement) {
      setElement(selectedElement);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };

      if (
        elementType.startsWith("image") ||
        elementType === "application/pdf" ||
        elementType === "video/mp4" ||
        elementType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedElement);
      } else {
        setPreview("");
      }
    }
  };

  const uploadToIPFS = async () => {
    if (!element) {
      toast.error("Please select an element first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", element);

    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: formData,
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_API_Key,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_API_Secret,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error uploading element to IPFS.");
      }

      const data = await response.json();
      const ipfsLink = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      setFileUrl(ipfsLink);
      console.log("Element uploaded to IPFS successfully.");
      toast.success("Element uploaded to IPFS successfully!");

      // After successful IPFS upload, send the IPFS link to the backend for validation
      validateMaskedElement(ipfsLink);
    } catch (error) {
      console.error("Error uploading element to IPFS:", error);
      toast.error("Error uploading element to IPFS.");
    }
  };

  const validateMaskedElement = async (ipfsLink) => {
    try {
      const response = await fetch("/api/validategetlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: ipfsLink }),
      });

      if (!response.ok) {
        throw new Error("Error validating element.");
      }

      const { link, username } = await response.json();
      setValidationResult(`Validation successful! Link: ${link}, Username: ${username}`);
      toast.success("Element validated successfully!");
    } catch (error) {
      console.error("Error validating element:", error);
      setValidationResult("Error validating element.");
      toast.error("Error validating element.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Validate Masked Element
      </h2>

      <div className="w-full mb-6">
        <label
          htmlFor="element-type"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Select Element Type
        </label>
        <select
          id="element-type"
          value={elementType}
          onChange={handleElementTypeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select element type</option>
          <option value="image/*">Image (JPEG, PNG, etc.)</option>
          <option value="application/pdf">PDF</option>
          <option value="application/msword">DOC</option>
          <option value="video/mp4">MP4 Video</option>
          <option value="audio/mp3">MP3 Audio</option>
        </select>
      </div>

      {elementType && (
        <>
          <div className="w-full mb-6">
            <input
              type="file"
              accept={elementType}
              onChange={handleElementChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          {preview && (
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Preview:
              </h3>
              {elementType.startsWith("image") && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-80 rounded-lg border border-gray-300"
                />
              )}
              {elementType === "application/pdf" && (
                <iframe
                  src={preview}
                  title="PDF Preview"
                  className="w-full h-80 border border-gray-300"
                />
              )}
              {elementType === "video/mp4" && (
                <video
                  src={preview}
                  controls
                  className="w-full h-80 border border-gray-300 rounded-lg"
                />
              )}
              {elementType === "audio/mp3" && (
                <audio
                  src={preview}
                  controls
                  className="w-full border border-gray-300 rounded-lg"
                />
              )}
            </div>
          )}
        </>
      )}

      <button
        onClick={uploadToIPFS}
        className="w-[50%] mb-6 px-6 py-2 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Upload and Validate
      </button>

      {validationResult && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-medium text-gray-800">Validation Result:</h3>
          <div className="w-full text-ellipsis text-nowrap overflow-hidden">
            <p className="text-blue-500">{validationResult}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidateMaskedElement;

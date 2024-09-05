"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from 'next/navigation';
import { verifyToken, verifyTokenLogin } from '@/lib/jwt';

const FileUploadAndProcess = () => {
  const [fileType, setFileType] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [maskingLevel, setMaskingLevel] = useState(1);
  const [processedLink, setProcessedLink] = useState("");
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    console.log(token);
    if (!token) {
      toast.error('You must be logged in to access this page.');
      return;
    }

    const user = verifyToken(token, username) || verifyTokenLogin(token, username);
    console.log(user);
    if (user) {
      console.log("User verified");
      setUsername(username?.trim());
    } else {
      toast.error('Invalid token. Please log in again.');
    }
  }, [router]);

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile(null);
    setPreview("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };

      if (
        fileType.startsWith("image") ||
        fileType === "application/pdf" ||
        fileType === "video/mp4" ||
        fileType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview("");
      }
    }
  };

  const UploadToIPFS = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

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
        throw new Error("Error uploading file to IPFS.");
      }

      const data = await response.json();
      setFileUrl(`https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
      console.log("File Uploaded Successfully.");
      toast.success("File uploaded to IPFS successfully!");
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      toast.error("Error uploading file to IPFS.");
    }
  };

  const getVulnerableFields = async () => {
    if (!fileUrl) {
      toast.error("No file URL found. Please upload a file first.");
      return;
    }

    try {
      const response = await fetch("/api/testVF", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileLink: fileUrl, fileType }),
      });

      if (!response.ok) {
        throw new Error("Error fetching vulnerable fields.");
      }

      const { vulnerableFields } = await response.json();
      setFields(vulnerableFields || []);
      toast.success("Vulnerable fields retrieved successfully!");
    } catch (error) {
      console.error("Error fetching vulnerable fields:", error);
      toast.error("Error fetching vulnerable fields.");
    }
  };

  const handleFieldChange = (e) => {
    const { value, checked } = e.target;
    setSelectedFields((prev) =>
      checked ? [...prev, value] : prev.filter((field) => field !== value)
    );
  };

  const handleMaskingChange = (e) => {
    setMaskingLevel(Number(e.target.value));
  };

  const handleNext = async () => {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field.");
      return;
    }

    const trimmedUsername = username.trim();

    console.log('Username before API call:', trimmedUsername);

    try {
      // Call the mask processing API
      const maskResponse = await fetch("/api/testMask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileLink: fileUrl,
          fileType,
          selectedFields,
          maskingLevel,
        }),
      });

      if (!maskResponse.ok) {
        throw new Error("Error processing file.");
      }

      const { processedLink } = await maskResponse.json();
      setProcessedLink(processedLink);
      toast.success("File processed successfully!");

      // Call the updateMetrics API to increase masks attribute by one
      const metricsResponse = await fetch("/api/updateMetrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incrementMask: 1,
          username: trimmedUsername
        }),
      });

      if (!metricsResponse.ok) {
        throw new Error("Error updating mask metrics.");
      }

      toast.success("Mask metrics updated successfully!");
    } catch (error) {
      console.error("Error processing file or updating metrics:", error);
      toast.error("Error processing file or updating mask metrics.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Upload and Process File
      </h2>

      <div className="w-full mb-6">
        <label
          htmlFor="file-type"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Select File Type
        </label>
        <select
          id="file-type"
          value={fileType}
          onChange={handleFileTypeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select file type</option>
          <option value="image/*">Image (JPEG, PNG, etc.)</option>
          <option value="application/pdf">PDF</option>
          <option value="application/msword">DOC</option>
          <option value="video/mp4">MP4 Video</option>
          <option value="audio/mp3">MP3 Audio</option>
        </select>
      </div>

      {fileType && (
        <>
          <div className="w-full mb-6">
            <input
              type="file"
              accept={fileType}
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          {preview && (
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-xl font-medium mb-2 text-gray-800">
                Preview:
              </h3>
              {fileType.startsWith("image") && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-80 rounded-lg border border-gray-300"
                />
              )}
              {fileType === "application/pdf" && (
                <iframe
                  src={preview}
                  title="PDF Preview"
                  className="w-full h-80 border border-gray-300"
                />
              )}
              {fileType === "video/mp4" && (
                <video
                  src={preview}
                  controls
                  className="w-full h-80 border border-gray-300 rounded-lg"
                />
              )}
              {fileType === "audio/mp3" && (
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
        onClick={UploadToIPFS}
        className="w-[50%] mb-6 px-6 py-2 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Upload to IPFS
      </button>

      {fileUrl && (
        <>
          <div className="w-full mb-6">
            <h3 className="text-lg font-medium text-gray-800">
              File uploaded to IPFS. Link:
            </h3>
            <div className="w-full text-ellipsis text-nowrap overflow-hidden  ">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline overflow-hidden w-[10%]"
              >
                {fileUrl}
              </a>
            </div>
          </div>
          <button
            onClick={getVulnerableFields}
            className="w-full mb-6 px-6 py-2 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Get Vulnerable Fields
          </button>
        </>
      )}

      {fields.length > 0 && (
        <div className="w-full mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-800">
            Select Vulnerable Fields:
          </h3>
          {fields.map((field) => (
            <div key={field} className="flex items-center mb-2">
              <input
                type="checkbox"
                value={field}
                onChange={handleFieldChange}
                className="mr-2"
              />
              <label className="text-gray-700">{field}</label>
            </div>
          ))}
        </div>
      )}

      <div className="w-full mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-800">
          Select Masking Level:
        </h3>
        <input
          type="range"
          min="1"
          max="4"
          value={maskingLevel}
          onChange={handleMaskingChange}
          className="w-full"
        />
        <div className="flex justify-between text-gray-600">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </div>

      <button
        onClick={handleNext}
        className={`w-full px-6 py-2 text-white font-semibold rounded-lg transition-colors ${selectedFields.length > 0
          ? "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          : "bg-gray-400 cursor-not-allowed"
          }`}
        disabled={selectedFields.length === 0}
      >
        Next Step
      </button>

      {processedLink && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-medium text-gray-800">Processed Link:</h3>
          <div className="w-full text-ellipsis text-nowrap overflow-hidden  ">
            <a
              href={processedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {processedLink}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadAndProcess;
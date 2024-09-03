"use client";

import React, { useState, useEffect } from 'react';

const Step3 = ({ fileLink = "https://gateway.pinata.cloud/ipfs/QmVbkNg7ffBStG7vmD9Qv2fwzgs5U14y3oJz6NAuGc8NCm", fileType = "image", fileName = "Myfile" }) => {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (fileLink) {
      setPreviewUrl(fileLink);
    }
  }, [fileLink]);

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileLink;
    link.download = fileName || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (fileType.startsWith('image')) {
      return <img src={previewUrl} alt="Preview" className="max-w-full max-h-80 rounded-lg border border-gray-300" />;
    }

    if (fileType === 'application/pdf') {
      return <iframe src={previewUrl} title="PDF Preview" className="w-full h-80 border border-gray-300" />;
    }

    if (fileType.startsWith('video')) {
      return <video src={previewUrl} controls className="w-full h-80 border border-gray-300 rounded-lg" />;
    }

    if (fileType.startsWith('audio')) {
      return <audio src={previewUrl} controls className="w-full border border-gray-300 rounded-lg" />;
    }

    if (fileType === 'text/plain') {
      return (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 overflow-auto">
          <pre className="whitespace-pre-wrap break-words text-gray-700">{previewUrl}</pre>
        </div>
      );
    }

    return <div className="text-gray-700">No preview available for this file type.</div>;
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-3xl mx-auto border border-gray-300 rounded-lg bg-white shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Step 3: Review and Download</h2>

      <div className="w-full mb-4">
        <h3 className="text-xl font-medium mb-2 text-gray-800">Content Preview:</h3>
        {renderPreview()}
      </div>

      <button
        onClick={downloadFile}
        className="px-6 py-2 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600"
      >
        Download
      </button>
    </div>
  );
};

export default Step3;

// components/ProcessEditorPage.js
import React from "react";

const ProcessEditorPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between mb-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Add New Section
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Add Built Section
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-200 p-4 text-center">Name of Section</div>
        <div className="bg-gray-200 p-4 text-center">Name of Section</div>
        <div className="bg-gray-200 p-4 text-center">Name of Section</div>
        <div className="bg-gray-200 p-4 text-center">Pre-made Section</div>
      </div>
      {/* Other content of your process editor page */}
    </div>
  );
};

export default ProcessEditorPage;

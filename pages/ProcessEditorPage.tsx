// components/ProcessEditorPage.js
import Layout from '@/app/layout';
import React from 'react';

const ProcessEditorPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between">
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
            Add New Section
          </button>
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
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
    </Layout>
  );
};

export default ProcessEditorPage;

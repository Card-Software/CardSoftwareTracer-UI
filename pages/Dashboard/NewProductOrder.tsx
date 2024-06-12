import React, { useState } from 'react';
import Layout from '@/app/layout';
import TracerButton from '@/components/TracerButton';
import { HiPlus } from 'react-icons/hi';

const NewProductOrder: React.FC = () => {
  const sampleTracStreams = [
    {
      id: 1,
      name: 'TracStream 1',
      description: 'This is the first TracStream',
      stages: 5,
      status: 'Active',
    },
    {
      id: 2,
      name: 'TracStream 2',
      stages: 4,
      description: 'This is the second TracStream',
    },
    {
      id: 3,
      name: 'TracStream 3',
      stages: 3,
      description: 'This is the third TracStream',
    },
  ];

  return (
    <Layout>
      <div>
        <a
          href="/Dashboard"
          className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
        >
          Traceability Stream
        </a>
        <span className="text-sm text-gray-500"> &gt; Add New PO</span>
      </div>
      <footer className="stream-footer space-between flex bg-gray-200">
        <div>
          <button
            className='hover:bg-blue-600" rounded-md bg-blue-500 px-4 py-2 text-white'
            //onClick={router.back}
          >
            Cancel
          </button>
        </div>
        <div>
          {' '}
          <button className='hover:bg-blue-600" ml-3 rounded-md bg-blue-500 px-4 py-2 text-white'>
            Save
          </button>
        </div>
      </footer>
    </Layout>
  );
};

export default NewProductOrder;

import Layout from '@/app/layout';
import TracerButton from '@/components/TracerButton';
import React, { useState } from 'react';
import '../../styles/dashboard.css';
import { HiPlus } from 'react-icons/hi';
import { useRouter } from 'next/router';

const TraceabilityStream = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [clients, setClients] = useState('');

  const handleSearch = () => {
    // Add search functionality here
    console.log('Search clicked', { name, clients });
  };

  const handleRedirect = () => {
    router.push('/TraceabilityStream/Details');
  };

  const handleClear = () => {
    setName('');
    setClients('');
  };
  return (
    <Layout>
      <div className="mb-5 flex flex-row items-center">
        <div className="me-8 text-xl">
          <h1>Traceability Stream</h1>
        </div>
        <div>
          <TracerButton name="Add" icon={<HiPlus />} onClick={handleRedirect} />
        </div>
      </div>
      <div className="flex flex-row items-start justify-start">
        <div className="rounded-lg bg-gray-100 p-6 shadow-md">
          <div className="mb-4 me-8 text-xl">
            <h1>Filters</h1>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Clients</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={clients}
              onChange={(e) => setClients(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <button
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mx-8">
          <table className="w-full table-auto border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Column 1</th>
                <th className="border border-gray-300 p-2">Column 2</th>
                <th className="border border-gray-300 p-2">Column 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Data 1</td>
                <td className="border border-gray-300 p-2">Data 2</td>
                <td className="border border-gray-300 p-2">Data 3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TraceabilityStream;

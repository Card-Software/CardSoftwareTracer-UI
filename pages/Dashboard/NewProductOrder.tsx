import React, { useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/traceabilityStream.css';
import { HiPlus } from 'react-icons/hi';

const NewProductOrder: React.FC = () => {
  const sampleTracStreams = [
    { id: 1, name: 'TracStream 1' },
    { id: 2, name: 'TracStream 2' },
    { id: 3, name: 'TracStream 3' },
  ];

  const sampleClients = [
    { id: 1, name: 'Client A' },
    { id: 2, name: 'Client B' },
    { id: 3, name: 'Client C' },
  ];

  const sampleUsers = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
  ];

  const existingPOs = [
    { id: 1, name: 'PO 1001' },
    { id: 2, name: 'PO 1002' },
    { id: 3, name: 'PO 1003' },
  ];

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [connectedPOs, setConnectedPOs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConnectPO = (poName: string) => {
    if (!connectedPOs.includes(poName)) {
      setConnectedPOs([...connectedPOs, poName]);
    }
    setSearchTerm('');
  };

  return (
    <Layout>
      <div className="mb-4">
        <a
          href="/Dashboard"
          className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
        >
          Traceability Stream
        </a>
        <span className="text-sm text-gray-500"> &gt; Add New PO</span>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Product Order</h1>
      </div>
      <div className="space-between mb-6 flex gap-5">
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            PO #
          </label>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          ></input>
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Assign To
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an associate
            </option>
            {sampleClients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select a client
          </option>
          {sampleClients.map((client) => (
            <option key={client.id} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Traceability Stream
        </label>
        <select
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select a traceability stream
          </option>
          {sampleTracStreams.map((stream) => (
            <option key={stream.id} value={stream.name}>
              {stream.name}
            </option>
          ))}
        </select>
      </div>

      {/* <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Connect to other PO(s)
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a PO"
          className="block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="relative mt-2">
          {searchTerm && (
            <div className="absolute max-h-48 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
              {existingPOs
                .filter((po) =>
                  po.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((po) => (
                  <div
                    key={po.id}
                    onClick={() => handleConnectPO(po.name)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                  >
                    {po.name}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="mt-4">
          {connectedPOs.map((po) => (
            <span
              key={po}
              className="mb-2 mr-2 inline-block rounded-full bg-blue-500 px-3 py-1 text-sm text-white"
            >
              {po}
            </span>
          ))}
        </div>
      </div> */}

      <footer className="stream-footer flex justify-between bg-gray-200 p-4">
        <div>
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => console.log('Cancel clicked')}
          >
            Cancel
          </button>
        </div>
        <div>
          <button
            className="ml-3 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => console.log('Save clicked')}
          >
            Save
          </button>
        </div>
      </footer>
    </Layout>
  );
};

export default NewProductOrder;

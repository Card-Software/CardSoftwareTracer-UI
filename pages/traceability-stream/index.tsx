import Layout from '@/app/layout';
import TracerButton from '@/components/tracer-button.component';
import React, { useEffect, useRef, useState } from 'react';
import '../../styles/dashboard.css';
import '@/styles/traceability-stream.css';
import { HiPlus } from 'react-icons/hi';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { TracerStream } from '@/models/tracer-stream';
import LoadingOverlay from '@/components/loading-overlay.component'; // Ensure the path is correct
import withAuth from '@/hoc/auth';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';

const TraceabilityStream = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [clients, setClients] = useState('');
  const [streams, setStreams] = useState<TracerStream[]>([]);
  const [filteredStreams, setFilteredStreams] = useState<TracerStream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasPageBeenRendered = useRef({ allTracersLoaded: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await orderManagementApiProxy.getAllTraceabilities();
        setStreams(data);
        setFilteredStreams(data);
      } catch (error) {
        console.error('Failed to fetch tracer streams', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasPageBeenRendered.current.allTracersLoaded) {
      hasPageBeenRendered.current.allTracersLoaded = true;
      fetchData();
    }
  }, []);

  const handleSearch = () => {
    const filtered = streams.filter((stream) =>
      stream.name.toLowerCase().includes(name.toLowerCase()),
    );
    setFilteredStreams(filtered);
  };

  const handleTracerClick =
    (id: string) => (event: React.MouseEvent<HTMLTableRowElement>) => {
      router.push('/traceability-stream/details?id=' + id);
    };

  const handleRedirect = () => {
    router.push('/traceability-stream/details');
  };

  const user: User = userAuthenticationService.getUser() as User;

  const IsAdmin = user.role.includes('Admin');

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="mb-5 flex flex-row items-center">
        <div className="me-8 text-xl">
          <h1>Traceability Stream</h1>
        </div>
        <div>
          {IsAdmin && (
            <TracerButton
              name="Add"
              icon={<HiPlus />}
              onClick={handleRedirect}
            />
          )}
        </div>
      </div>
      <div className="flex flex-row items-start justify-start">
        {/* <div className="rounded-lg bg-gray-100 p-6 shadow-md">
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
              className="rounded-md bg-teal-800 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
        </div> */}
        <div className="mx-8 w-full overflow-auto">
          <table className="w-full border-collapse border border-teal-700">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="border border-teal-700 px-4 py-2">Name</th>
                <th className="border border-teal-700 px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredStreams.map((stream) => (
                <tr
                  key={stream.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={handleTracerClick(stream.name || '')}
                >
                  <td className="border border-teal-700 px-4 py-2">
                    {stream.name}
                  </td>
                  <td className="border border-teal-700 px-4 py-2">
                    {/* Example detail content */}

                    <span className="mt-1 block text-sm text-gray-500">
                      {stream.sections
                        .map((section) => section.sectionName)
                        .join(', ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(TraceabilityStream);

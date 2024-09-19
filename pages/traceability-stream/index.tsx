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
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1>Traceability Stream</h1>
        </div>
        <div className="tool-bar-buttons">
          {IsAdmin && (
            <TracerButton
              name="Add"
              icon={<HiPlus />}
              onClick={handleRedirect}
            />
          )}
        </div>
      </div>
      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div className="flex flex-row items-start justify-start">
        <div className="w-full overflow-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-400 text-white">
                <th className="border-b border-gray-300 px-4 py-2">Name</th>
                <th className="border-b border-gray-300 px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredStreams.map((stream, index) => (
                <tr
                  key={stream.id}
                  className={`cursor-pointer ${
                    index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                  } hover:bg-gray-200`}
                  onClick={handleTracerClick(stream.name || '')}
                >
                  <td className="border-b border-gray-300 px-4 py-2">
                    {stream.name}
                  </td>
                  <td className="border-b border-gray-300 px-4 py-2">
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

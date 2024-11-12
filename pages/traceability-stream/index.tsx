import Layout from '@/app/layout';
import TracerButton from '@/components/tracer-button.component';
import React, { useEffect, useRef, useState } from 'react';
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
      <div className="content">
        <div aria-label="Toolbar">
          <div className="tool-bar-content">
            <h1>Traceability Stream</h1>
            <div className="row">
              {IsAdmin && (
                <TracerButton
                  name="Add"
                  icon={<HiPlus />}
                  onClick={handleRedirect}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start justify-start">
          <div className="w-full overflow-auto">
            <table className="standard-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredStreams.map((stream, index) => (
                  <tr
                    key={stream.id}
                    className="!important hover:bg-gray-200"
                    onClick={handleTracerClick(stream.name || '')}
                  >
                    <td>{stream.name}</td>
                    <td style={{ whiteSpace: 'wrap' }}>
                      <span>
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
      </div>
    </Layout>
  );
};

export default withAuth(TraceabilityStream);

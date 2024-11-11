import { useRouter } from 'next/router';
import withAuth from '@/hoc/auth';
import Layout from '@/app/layout';
import { HiPlus } from 'react-icons/hi';
import TracerButton from '@/components/tracer-button.component';
import RequestModal from '@/components/modals/request-modal.component';
import { TierRequest, TierRequestMaterialized } from '@/models/tier-request';
import { useState } from 'react';

const RequestsPage: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [clickedTierRequest, setClickedTierRequest] = useState<TierRequest>();
  const [showModal, setShowModal] = useState(false);

  const tierRequests: TierRequestMaterialized[] = [
    {
      id: 'req-001',
      requesterTierReference: 'TIER-SJ01',
      requesterOrganizationId: 'org-sierra-textiles',
      requesterOrganizationName: 'Sierra Textiles',
      requesterProductOrderInfo: {
        productOrderReference: 'PO-2024-001',
        productOrderNumber: '2024-001',
      },
      requesteeOrganizationId: 'org-honduras-spinning-mills',
      requesteeOrganizationName: 'Honduras Spinning Mills',
      tierInfo: {
        id: 'tier-rm01',
        name: 'Raw Materials Extraction',
        tierLevel: 3,
        description:
          'Requesting extraction process standards for raw materials',
      },
      completed: true,
      emailRecipient: 'honduras@spinningmills.com',
      requesteeProductOrderReference: 'PO-2024-001',
      requesteeTierReference: '123sdf-234sdf-345sdf',
      requestTime: new Date('2024-10-15T10:00:00Z'),
      completedTime: new Date('2024-10-16T10:00:00Z'),
      sharePreviousTiers: true, // Allows showing previous tiers in UI
    },
    {
      id: 'req-002',
      requesterTierReference: 'TIER-RM03',
      requesterProductOrderInfo: {
        productOrderReference: 'PO-2024-002',
        productOrderNumber: '2024-002',
      },
      requesterOrganizationId: 'org-northern-textiles',
      requesterOrganizationName: 'Northern Textiles',
      requesteeOrganizationId: 'org-sierra-textiles',
      requesteeOrganizationName: 'Sierra Textiles',
      tierInfo: {
        id: 'tier-rm03',
        name: 'Raw Materials',
        tierLevel: 3,
        description: 'Details on raw materials used in fabric production',
      },
      completed: false, // This request is not yet completed
      emailRecipient: 'sierra@sierratextiles.com',
      requesteeProductOrderReference: undefined,
      requesteeTierReference: undefined,
      requestTime: new Date('2024-09-22T14:30:00Z'),
      sharePreviousTiers: false, // Previous tiers are not shared in this request
    },
  ];

  const filteredRequests = tierRequests.filter((request) => {
    if (filter === 'all') return true;
    if (filter === 'sent')
      return request.requesterOrganizationId === 'org-sierra-textiles';
    if (filter === 'received')
      return request.requesteeOrganizationId === 'org-sierra-textiles';
  });

  const onTierRequestClick = (tierRequest: TierRequest) => {
    setClickedTierRequest(tierRequest);
    setShowModal(true);
  };

  const onModalClose = () => {
    setShowModal(false);
  };

  return (
    <Layout>
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            Requests
          </h1>
        </div>
        <div className="tool-bar-buttons">
          <div className="ml-4 flex items-center">
            <button
              onClick={() => setFilter('all')}
              className={`mx-2 ${filter === 'all' ? 'font-semibold text-blue-500' : ''}`}
            >
              All Requests
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`mx-2 ${filter === 'sent' ? 'font-semibold text-blue-500' : ''}`}
            >
              Sent Requests
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`mx-2 ${filter === 'received' ? 'font-semibold text-blue-500' : ''}`}
            >
              Received Requests
            </button>
          </div>
          <TracerButton
            name="Start New Request"
            icon={<HiPlus />}
            onClick={() => {}}
          />
        </div>
      </div>
      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div>
        <table className="standard-table">
          <thead>
            <tr>
              <th scope="col">Requestor</th>
              <th scope="col">Requestee</th>
              <th scope="col">Product Order Number</th>
              <th scope="col">Tier</th>
              <th scope="col">Status</th>
              <th scope="col">Date Requested</th>
              <th scope="col">Date Completed</th>
              <th scope="col">View of Previous Tiers</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} onClick={() => onTierRequestClick(request)}>
                <td>{request.requesterOrganizationName}</td>
                <td>{request.requesteeOrganizationName}</td>
                <td>{request.requesterProductOrderInfo?.productOrderNumber}</td>
                <td>
                  ({request.tierInfo.tierLevel}){request.tierInfo.name}
                </td>
                <td>
                  {request.completed ? (
                    <span className="text-green-500">Completed</span>
                  ) : (
                    <span className="text-red-500">Pending</span>
                  )}
                </td>
                <td>{request.requestTime?.toLocaleString()}</td>
                <td>
                  {request.completedTime
                    ? request.completedTime.toLocaleString()
                    : 'N/A'}
                </td>
                <td>
                  {request.sharePreviousTiers ? (
                    <span className="text-green-500">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RequestModal
        onClose={() => {
          onModalClose();
        }}
        tierRequest={clickedTierRequest}
        isOpen={showModal}
      />
    </Layout>
  );
};

export default withAuth(RequestsPage);

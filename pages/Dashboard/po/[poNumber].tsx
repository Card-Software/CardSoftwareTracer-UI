import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/app/layout';
import '../../../styles/dashboard.css';
import styled from 'styled-components';
import {
  FaExclamationCircle,
  FaArrowRight,
  FaCheckCircle,
  FaFileExport,
  FaPencilAlt,
  FaTrash,
} from 'react-icons/fa';
import SectionModal from '@/components/SectionModal';
import TracerStreamModal from '@/components/TracerStreamModal';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import Link from 'next/link';
import { Section as SectionModel } from '@/models/Section';
import { TracerStreamExtended, TracerStream } from '@/models/TracerStream';
import { User } from '@/models/User';
import TracerButton from '@/components/TracerButton';
import { HiPlus } from 'react-icons/hi';
import { fileManagementService } from '@/services/FileManagement.service';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import LoadingOverlay from '@/components/LoadingOverlay';
import withAuth from '@/hoc/auth';
import TeamStatuses from '@/components/TeamStatuses'; // Import TeamStatuses
import { Status } from '@/models/Status'; // Import Status
import { v4 as uuidv4 } from 'uuid';
import { organizationManagementProxy } from '@/proxies/OrganizationManagement.proxy';
import ExportModal from '@/components/ExportModal';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;
  const user = userAuthenticationService.getUser();
  const organization = userAuthenticationService.getOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [productOrder, setProductOrder] = useState<ProductOrder | null>(null);
  const [linkedOrders, setLinkedOrders] = useState<ProductOrder[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionModel | null>(
    null,
  );
  const [selectedStream, setSelectedStream] =
    useState<TracerStreamExtended | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamModalMode, setStreamModalMode] = useState<'edit' | 'add'>('add');
  const [statuses, setStatuses] = useState<Status[]>([]); // New state for statuses
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // State for export modal
  const [streamToExport, setStreamToExport] =
    useState<TracerStreamExtended | null>(null);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (poNumber) {
        setIsLoading(true);
        const order = await orderManagementApiProxy.getProductOrder(
          poNumber as string,
        );
        setIsLoading(false);
        setProductOrder(order);
        setStatuses(order.statuses || []); // Set initial statuses

        if (
          order.childrenPosReferences &&
          order.childrenPosReferences.length > 0
        ) {
          const linkedOrderDetails = await Promise.all(
            order.childrenPosReferences.map((ref) =>
              orderManagementApiProxy.getProductOrder(ref),
            ),
          );
          setLinkedOrders(linkedOrderDetails);
        }
      }
    };

    fetchOrderDetails();
  }, [poNumber]);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await organizationManagementProxy.GetAllUsers();
      setAllUsers(users);
    };

    fetchUsers();
  }, [user, organization]);

  const handleProductOrderChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setProductOrder((prevOrder) => ({
      ...prevOrder!,
      [name]: value,
    }));
  };

  const handleAssignedUserChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const userId = e.target.value;
    const assignedUser = allUsers.find((user) => user.id === userId);
    if (assignedUser) {
      setProductOrder((prevOrder) => ({
        ...prevOrder!,
        assignedUser: assignedUser,
      }));
    }
  };

  const handleStatusChange = (newStatuses: Status[]) => {
    setStatuses(newStatuses);
    if (productOrder) {
      setProductOrder({ ...productOrder, statuses: newStatuses });
    }
  };

  const handleSectionClick = (
    section: SectionModel,
    stream: TracerStreamExtended,
  ) => {
    setSelectedSection(section);
    setSelectedStream(stream);
    setIsSectionModalOpen(true);
  };

  const handleDeleteStream = (streamToDelete: TracerStreamExtended) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this stream?',
    );
    if (confirmDelete && productOrder) {
      const updatedStreams = productOrder.childrenTracerStreams.filter(
        (stream) => stream.id !== streamToDelete.id,
      );
      setProductOrder({
        ...productOrder,
        childrenTracerStreams: updatedStreams,
      });
    }
  };

  const handleStreamClick = (
    stream: TracerStreamExtended,
    mode: 'edit' | 'add',
  ) => {
    setSelectedStream(stream);
    setStreamModalMode(mode);
    setIsStreamModalOpen(true);
  };

  const isExportEnabled = (stream: TracerStreamExtended) => {
    const requiredSections = stream.sections.filter(
      (section) => section.isRequired,
    );
    return requiredSections.every((section) => section.files.length > 0);
  };

  const handleDeleteSection = (
    stream: TracerStreamExtended,
    section: SectionModel,
  ) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this section?',
    );
    if (confirmDelete && productOrder) {
      const updatedStreams = productOrder.childrenTracerStreams.map((str) => {
        if (str.id === stream.id) {
          return {
            ...str,
            sections: str.sections.filter(
              (sec) => sec.sectionId !== section.sectionId,
            ),
          };
        }
        return str;
      });
      setProductOrder({
        ...productOrder,
        childrenTracerStreams: updatedStreams,
      });
    }
  };

  const handleCloseSectionModal = () => {
    setIsSectionModalOpen(false);
    setSelectedSection(null);
  };

  const handleCloseStreamModal = () => {
    setIsStreamModalOpen(false);
    setSelectedStream(null);
  };

  const handleExportButton = (stream: TracerStreamExtended) => {
    setStreamToExport(stream);
    setIsExportModalOpen(true);
    // if (!productOrder) return;
    // fileManagementService.downloadFilesFromS3Bucket(stream, productOrder);
  };

  const exportStream = async (
    stream: TracerStreamExtended,
    includedSections: SectionModel[],
  ) => {
    if (!productOrder) return;
    const result = await fileManagementService.downloadFilesFromS3Bucket(
      stream,
      productOrder,
      includedSections,
    );

    if (result) {
      alert('Files downloaded successfully!');
    } else {
      alert('Failed to download files.');
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (productOrder) {
      try {
        setIsLoading(true);
        const response =
          await orderManagementApiProxy.updateProductOrder(productOrder);
        setIsLoading(false);
        if (response.status === 204) {
          router.push(`/Dashboard/po/${productOrder.productOrderNumber}`);
          alert('Product Order updated successfully!');
        } else {
          alert(`Failed to save Product Order. Status: ${response.status}`);
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to save Product Order', error);
        alert('Failed to save Product Order');
      }
    }
  };

  if (!productOrder) {
    return (
      <Layout>
        <LoadingOverlay show={true} />
      </Layout>
    );
  }

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <Container>
        <div>
          <Link
            href="/Dashboard"
            className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
          >
            Dashboard
          </Link>
          <span className="text-sm text-gray-500"> &gt; PO Details</span>
        </div>
        <Section>
          <div className="align-center my-2 mb-8 flex gap-5">
            <div>
              <h1 className="text-2xl font-bold">Product Order Details</h1>
            </div>
            <div className="flex gap-5">
              <TracerButton
                name="Add Tracer Stream"
                icon={<HiPlus />}
                onClick={() =>
                  handleStreamClick({} as TracerStreamExtended, 'add')
                }
              />
            </div>
          </div>

          <DetailItem className="mb-4 flex items-center">
            <strong className="mr-2">PO Number:</strong>
            <span>{productOrder.productOrderNumber}</span>
          </DetailItem>

          <DetailItem className="mb-4 flex items-center">
            <strong className="mr-2">External PO Number:</strong>
            <input
              type="text"
              id="externalProductOrderNumber"
              name="externalProductOrderNumber"
              value={productOrder.externalProductOrderNumber}
              onChange={handleProductOrderChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-600 focus:ring-teal-600"
            />
          </DetailItem>

          <DetailItem className="mb-4">
            <strong>Assigned to:</strong>
            <select
              value={productOrder.assignedUser?.id}
              onChange={handleAssignedUserChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select an associate</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastname}
                </option>
              ))}
            </select>
          </DetailItem>

          <DetailItem className="mb-4">
            <strong>Client:</strong>
            <input
              type="text"
              id="client"
              name="client"
              value={productOrder.client}
              onChange={handleProductOrderChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-600 focus:ring-teal-600"
            />
          </DetailItem>

          <DetailItem className="mb-4 flex items-center">
            <label htmlFor="quantity" className="mr-2 block">
              <strong>Quantity:</strong>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={productOrder.quantity}
              onChange={(e) =>
                setProductOrder({
                  ...productOrder,
                  quantity: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-600 focus:ring-teal-600"
            />
          </DetailItem>

          <DetailItem className="mb-4">
            <label htmlFor="description" className="block">
              <strong>Description:</strong>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={productOrder.description}
              onChange={handleProductOrderChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-600 focus:ring-teal-600"
            />
          </DetailItem>

          <TeamStatuses
            originalStatus={statuses}
            onChange={handleStatusChange}
          />

          <CardContainer>
            {productOrder.childrenTracerStreams.map((stream, index) => (
              <React.Fragment key={stream.id}>
                <Card>
                  <CardTitle>
                    <div className="flex w-full flex-row justify-between">
                      <div className="flex flex-col">
                        <p>
                          <strong>Name:</strong> {stream.friendlyName}
                        </p>
                        <p>
                          <strong>Product:</strong> {stream.product}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {stream.quantity}
                        </p>
                      </div>
                      <div className="flex">
                        <button
                          className="ml-2 rounded bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportButton(stream);
                          }}
                        >
                          <FaFileExport />
                        </button>
                        <button
                          className="ml-2 rounded bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStreamClick(stream, 'edit');
                          }}
                        >
                          <FaPencilAlt />
                        </button>

                        <button
                          className="ml-2 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStream(stream);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </CardTitle>
                  <SectionContainer>
                    {stream.sections.map((section, secIndex) => (
                      <React.Fragment key={section.sectionId}>
                        <SectionCard
                          onClick={() => handleSectionClick(section, stream)}
                          isRequired={section.isRequired}
                        >
                          <CardTitle className="w-full">
                            {section.sectionName}
                            {section.files.length > 0 ? (
                              <FaCheckCircle
                                color="green"
                                style={{ marginLeft: '10px' }}
                              />
                            ) : (
                              <FaExclamationCircle
                                color="red"
                                style={{ marginLeft: '10px' }}
                              />
                            )}
                            <DeleteButton
                              className="flex justify-end"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevents parent click event from firing
                                handleDeleteSection(stream, section); // Call delete function
                              }}
                            >
                              <FaTrash />
                            </DeleteButton>
                          </CardTitle>
                          <CardDetails>
                            <DetailItem>
                              <strong>Description:</strong>{' '}
                              {section.sectionDescription}
                            </DetailItem>
                            {section.assignedUser && (
                              <DetailItem>
                                <strong>Assigned to:</strong>{' '}
                                {section.assignedUser.firstName}{' '}
                                {section.assignedUser.lastname}
                              </DetailItem>
                            )}
                            {section.notes && section.notes.length > 0 && (
                              <DetailItem>
                                <strong>Notes:</strong>
                                <ul>
                                  {section.notes.map((note) => (
                                    <li key={note.id}>{note.content}</li>
                                  ))}
                                </ul>
                              </DetailItem>
                            )}
                            {section.teamLabels &&
                              section.teamLabels.length > 0 && (
                                <DetailItem>
                                  <strong>Team Labels:</strong>
                                  <ul className="flex gap-2">
                                    {section.teamLabels.map((label) => (
                                      <li
                                        key={label.id}
                                        className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
                                      >
                                        {label.labelName}
                                      </li>
                                    ))}
                                  </ul>
                                </DetailItem>
                              )}
                          </CardDetails>
                        </SectionCard>
                        {secIndex < stream.sections.length - 1 && (
                          <ArrowIcon>
                            <FaArrowRight size={24} />
                          </ArrowIcon>
                        )}
                      </React.Fragment>
                    ))}
                    <ArrowIcon>
                      <FaArrowRight size={24} />
                    </ArrowIcon>
                    <SectionCard
                      isRequired={false}
                      onClick={() => {
                        if (!user || !organization) return;
                        handleSectionClick(
                          {
                            sectionId: uuidv4(),
                            sectionName: '',
                            sectionDescription: '',
                            assignedUser: user,
                            notes: [],
                            position: 0,
                            fileNameOnExport: '',
                            files: [],
                            isRequired: true,
                            ownerRef: organization.id || '',
                            teamLabels: [],
                          },
                          stream,
                        );
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <AddNewButton className="rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-600">
                          Add New Section
                        </AddNewButton>
                      </div>
                    </SectionCard>
                  </SectionContainer>
                </Card>
              </React.Fragment>
            ))}
          </CardContainer>
        </Section>
      </Container>
      <footer className="stream-footer flex bg-gray-200 p-4">
        <button
          className="me-6 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600"
          onClick={handleSave}
        >
          Save
        </button>
      </footer>
      {isSectionModalOpen && selectedSection && selectedStream && (
        <SectionModal
          productOrder={productOrder.productOrderNumber}
          tracerStreamId={selectedStream.id}
          originalSection={selectedSection}
          onClose={handleCloseSectionModal}
          onSave={(updatedSection: SectionModel) => {
            setProductOrder((prevOrder) => {
              if (!prevOrder) return null;

              const updatedStreams = prevOrder.childrenTracerStreams.map(
                (stream) =>
                  stream.id === selectedStream.id
                    ? {
                        ...stream,
                        sections: stream.sections.map((section) =>
                          section.sectionId === updatedSection.sectionId
                            ? updatedSection
                            : section,
                        ),
                      }
                    : stream,
              );

              return { ...prevOrder, childrenTracerStreams: updatedStreams };
            });

            handleCloseSectionModal();
          }}
          mode={
            selectedSection.sectionId
              ? 'edit'
              : 'sectionCreationOnExistingTracer'
          }
        />
      )}
      {isStreamModalOpen && selectedStream && (
        <TracerStreamModal
          originalTracerStream={
            streamModalMode === 'edit' ? selectedStream : null
          }
          onClose={handleCloseStreamModal}
          onSave={(updatedStream: TracerStreamExtended) => {
            if (streamModalMode === 'add' && productOrder) {
              setProductOrder({
                ...productOrder,
                childrenTracerStreams: [
                  ...productOrder.childrenTracerStreams,
                  updatedStream,
                ],
              });
            } else if (streamModalMode === 'edit' && productOrder) {
              setProductOrder({
                ...productOrder,
                childrenTracerStreams: productOrder.childrenTracerStreams.map(
                  (stream) =>
                    stream.id === updatedStream.id ? updatedStream : stream,
                ),
              });
            }

            handleCloseStreamModal();
          }}
          mode={streamModalMode}
        />
      )}
      {isExportModalOpen && streamToExport && (
        <ExportModal
          stream={streamToExport}
          onClose={() => {
            setIsExportModalOpen(false);
            setStreamToExport(null);
          }}
          onExport={(includedSections) => {
            exportStream(streamToExport, includedSections);
          }}
        />
      )}
    </Layout>
  );
};

export default withAuth(PurchaseOrderPage);

const Container = styled.div`
  padding: 20px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  flex-grow: 1;
`;

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  align-items: center;
`;

const SectionCard = styled(Card)<{ isRequired: boolean }>`
  flex: 1 1 calc(25% - 20px);
  min-width: 250px;
  max-width: 300px;
  margin-bottom: 20px;
  word-wrap: break-word;
  background-color: ${(props) => (props.isRequired ? '#fff' : '#e5e7eb')};
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  font-size: 24px;
  color: gray;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
`;

const CardDetails = styled.div`
  font-size: 14px;
`;

const DetailItem = styled.div`
  margin-bottom: 16px;
`;

const AddNewButton = styled.button`
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background-color: #319795;
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  margin-left: 5px;
  cursor: pointer;
  font-size: 16px;
  color: #f56565;
`;

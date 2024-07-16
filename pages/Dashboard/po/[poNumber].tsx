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
import { Site } from '@/models/Site';

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
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamModalMode, setStreamModalMode] = useState<'edit' | 'add'>('add');
  const [statuses, setStatuses] = useState<Status[]>([]); // New state for statuses
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // State for export modal
  const [streamToExport, setStreamToExport] =
    useState<TracerStreamExtended | null>(null);
  const [childrenPos, SetChildrenPos] = useState<ProductOrder[]>([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (poNumber) {
        setIsLoading(true);

        const order = await orderManagementApiProxy.getProductOrder(
          poNumber as string,
        );

        if (order.childrenPosReferences.length > 0) {
          getChildrenPos(order.childrenPosReferences);
        }

        if (order.statuses.length === 0) {
          order.statuses = [
            { team: 'Planning', teamStatus: 'Pending', feedback: '' },
            { team: 'SAC', teamStatus: 'Pending', feedback: '' },
            { team: 'NT', teamStatus: 'Pending', feedback: '' },
          ];
        }
        setAllSites(userAuthenticationService.getOrganization()?.sites || []);
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

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const siteRef = e.target.value;
    setProductOrder((prevOrder) => ({
      ...prevOrder!,
      siteRef: siteRef,
    }));
  };

  const getChildrenPos = async (productOrderNumbers: string[]) => {
    const childrenPos = await Promise.all(
      productOrderNumbers.map((ref) =>
        orderManagementApiProxy.getProductOrder(ref),
      ),
    );
    SetChildrenPos(childrenPos);
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
    setIsLoading(true);
    const result = await fileManagementService.downloadFilesFromS3Bucket(
      stream,
      productOrder,
      includedSections,
    );

    setIsExportModalOpen(false);
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

          <div className="space-between mb-4 flex gap-5">
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                PO Number
              </label>
              <span className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900">
                {productOrder.productOrderNumber}
              </span>
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                External PO Number
              </label>
              <input
                type="text"
                id="externalProductOrderNumber"
                name="externalProductOrderNumber"
                value={productOrder.externalProductOrderNumber}
                onChange={handleProductOrderChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Client
              </label>
              <input
                type="text"
                id="client"
                name="client"
                value={productOrder.client}
                onChange={handleProductOrderChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-between mb-4 flex gap-5">
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Site
              </label>
              <select
                value={productOrder.siteRef || ''}
                onChange={handleSiteChange}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an site</option>
                {allSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Assigned to
              </label>
              <select
                value={productOrder.assignedUser?.id}
                onChange={handleAssignedUserChange}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an associate</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastname}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Quantity
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-between mb-4 flex gap-5">
            <div className="form-box w-full">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Provide Description"
                id="description"
                name="description"
                value={productOrder.description}
                onChange={handleProductOrderChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="my-6">
            <TeamStatuses
              originalStatus={statuses}
              onChange={handleStatusChange}
            />
          </div>

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
                          $isrequired={section.isRequired}
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
                                  <strong>Labels:</strong>
                                  <ul className="flex gap-2">
                                    {section.teamLabels.map((label) => (
                                      <li
                                        key={label.id}
                                        className="max-w-[115px] truncate rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
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
                      $isrequired={false}
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
          {childrenPos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Linked Product Orders</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {childrenPos.map((po) => (
                  <div
                    key={po.productOrderNumber}
                    className="rounded-lg bg-white p-6 shadow-lg"
                  >
                    <h3 className="text-lg font-bold">
                      {po.productOrderNumber} - {po.client}
                    </h3>
                    <p className="text-sm text-gray-500">{po.description}</p>
                    <Link href={`/Dashboard/po/${po.productOrderNumber}`}>
                      <p className="">View Details</p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                        sections: stream.sections.some(
                          (section) =>
                            section.sectionId === updatedSection.sectionId,
                        )
                          ? stream.sections.map((section) =>
                              section.sectionId === updatedSection.sectionId
                                ? updatedSection
                                : section,
                            )
                          : [...stream.sections, updatedSection],
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

const SectionCard = styled.div<{ $isrequired: boolean }>`
  flex: 1 1 calc(25% - 20px);
  min-width: 250px;
  max-width: 300px;
  margin-bottom: 20px;
  word-wrap: break-word;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  background-color: ${(props) => (props.$isrequired ? '#fff' : '#e5e7eb')};
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

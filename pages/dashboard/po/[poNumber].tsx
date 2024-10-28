import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/app/layout';
import '../../../styles/dashboard.css';
import '../../../styles/product-order-details.css';
import styled from 'styled-components';
import { ObjectId } from 'bson';
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaFileExport,
  FaPencilAlt,
  FaTrash,
  FaHistory,
} from 'react-icons/fa';
import Notes from '@/components/notes.component';
import SectionModal from '@/components/modals/section-modal.component';
import TracerStreamModal from '@/components/modals/tracer-stream-modal.component';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { ProductOrder } from '@/models/product-order';
import Link from 'next/link';
import { Section as SectionModel } from '@/models/section';
import { TracerStreamExtended, TracerStream } from '@/models/tracer-stream';
import { User } from '@/models/user';
import TracerButton from '@/components/tracer-button.component';
import { HiPlus } from 'react-icons/hi';
import { fileManagementService } from '@/services/file-management.service';
import { userAuthenticationService } from '@/services/user-authentication.service';
import LoadingOverlay from '@/components/loading-overlay.component';
import withAuth from '@/hoc/auth';
import TeamStatuses from '@/components/team-statuses.component'; // Import TeamStatuses
import { Status } from '@/models/status';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import ExportModal from '@/components/modals/export-modal.component';
import { activityLogProxy } from '@/proxies/activity-log.proxy';
import { ActivityLog } from '@/models/activity-log';
import ActivityLogModal from '@/components/modals/activity-log-modal.component';
import { ActivityType } from '@/models/enum/activity-type';
import 'react-datepicker/dist/react-datepicker.css';
import { emailService } from '@/services/email.service';
import SiblingProductOrdersModal from '@/components/modals/sibling-product-orders-modal.component';
import { SiblingProductOrder } from '@/models/sibling-product-order';
import ProductOrderDetails from '@/components/product-order-details';
import { Note } from '@/models/note';
import AlertModal from '@/components/modals/alert-modal-component';
import toast, { Toaster } from 'react-hot-toast';
import { activityLogService } from '@/services/activity-logs.service';
import TraceabilityStreamComponent from '@/components/traceability/traceability-stream';
import { Tier } from '@/models/tier';
import TiersComponent from '@/components/traceability/tiers.component';
import { TeamStatusExtended } from '@/models/team-status';
import { teamStatusProxy } from '@/proxies/team-status.proxy';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;
  const user = userAuthenticationService.getUser() as User;
  const organization = userAuthenticationService.getOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [productOrder, setProductOrder] = useState<ProductOrder | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionModel | null>(
    null,
  );
  const [selectedStream, setSelectedStream] =
    useState<TracerStreamExtended | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamModalMode, setStreamModalMode] = useState<'edit' | 'add'>('add');
  const [statuses, setStatuses] = useState<TeamStatusExtended[]>([]); // New state for statuses
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // State for export modal
  const [streamToExport, setStreamToExport] =
    useState<TracerStreamExtended | null>(null);
  const [childrenPos, SetChildrenPos] = useState<ProductOrder[]>([]);
  const [originalProductOrder, setOriginalProductOrder] =
    useState<ProductOrder | null>(null);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [activityLogsToDisplay, setActivityLogsToDisplay] = useState<
    ActivityLog[]
  >([]);
  const [activityLogType, setActivityLogType] = useState<ActivityType>(
    ActivityType.FileUpload,
  );
  const [allActivityLogs, setAllActivityLogs] = useState<ActivityLog[]>([]);
  const [isSiblingProductOrderModalOpen, setIsSiblingProductOrderModalOpen] =
    useState(false);
  const [siblingPoTextDisplay, setSiblingPoTextDisplay] = useState<string>('');

  const isAdmin = user.role.includes('Admin');
  const currentUser = userAuthenticationService.getUser() as User;

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAlertModalOpenStream, setIsAlertModalOpenStream] = useState(false);
  const [isAlertModalOpenSection, setIsAlertModalOpenSection] = useState(false);
  const [poToDelete, setPoToDelete] = useState<ProductOrder | null>(null);
  const [streamToDeleteModal, setStreamToDelete] =
    useState<TracerStream | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionModel | null>(
    null,
  );

  const [tiersData, setTiersData] = useState<Tier[]>([
    {
      id: '1',
      name: 'Tier 1',
      description: 'Tier 1 Description',
      tracerStream: null,
    },
    {
      id: '2',
      name: 'Tier 2',
      description: 'Tier 2 Description',
      tracerStream: null,
    },
    {
      id: '3',
      name: 'Tier 3',
      description: 'Tier 3 Description',
      tracerStream: null,
    },
    {
      id: '4',
      name: 'Tier 4',
      description: 'Tier 4 Description',
      tracerStream: null,
    },
  ]);

  //#region Notify Alerts
  const notify = () => toast.success('Product Order updated successfully!');
  const notifyError = () => toast.error('Failed to save Product Order');
  const notifyDelete = () =>
    toast.success('Product Order deleted successfully!');
  const notifyDeleteError = () => toast.error('Failed to delete Product Order');
  const notifyDeleteStream = () =>
    toast.success('Tracer Stream deleted successfully!');
  const notifyDeleteErrorStream = () =>
    toast.error('Failed to delete Tracer Stream');
  const notifyDeleteSection = () =>
    toast.success('Section deleted successfully!');
  const notifyDeleteErrorSection = () =>
    toast.error('Failed to delete Section');
  //#endregion

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (poNumber) {
        setIsLoading(true);

        const order = await orderManagementApiProxy.getProductOrder(
          poNumber as string,
        );

        if (order?.childrenTracerStreams?.length > 0) {
          console.log('Order:', order);
          setTiersData((prevTiers) =>
            prevTiers.map((tier, index) =>
              index === 0
                ? { ...tier, tracerStream: order.childrenTracerStreams[0] }
                : tier,
            ),
          );
        }

        setOriginalProductOrder(order);

        if (order.childrenPosReferences.length > 0) {
          getChildrenPos(order.childrenPosReferences);
        }

        if (order.teamStatuses.length === 0) {
          const statuses = await teamStatusProxy.getAllTeamStatus();
          const statusesExtended = statuses.map((status) => ({
            id: status.id as string,
            name: status.name,
            selectedValue: '',
            feedback: '',
          }));
          order.teamStatuses = statusesExtended;
        }
        setIsLoading(false);
        setProductOrder(order);
        setStatuses(order.teamStatuses || []); // Set initial statuses

        activityLogProxy.getActivityLogByPo(order.id as string).then((logs) => {
          setAllActivityLogs(logs);
        });

        if (
          order.childrenPosReferences &&
          order.childrenPosReferences.length > 0
        ) {
          const linkedOrderDetails = await Promise.all(
            order.childrenPosReferences.map((ref) =>
              orderManagementApiProxy.getProductOrder(ref),
            ),
          );
        }
      }
    };

    fetchOrderDetails();
  }, [poNumber]);

  useEffect(() => {
    const siblingProductOrders = productOrder?.siblingProductOrders;
    if (siblingProductOrders) {
      if (siblingProductOrders.length === 0) {
        setSiblingPoTextDisplay('');
      } else {
        setSiblingPoTextDisplay(`(${siblingProductOrders.length}) `);
      }
    } else {
      setSiblingPoTextDisplay('');
    }
  }, [productOrder?.siblingProductOrders]);

  const [fetchingUsers, setFetchingUsers] = useState(false);

  const hasPageBeenRendered = useRef({ allUsersLoaded: false });

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await organizationManagementProxy.GetAllUsers();
      setAllUsers(users);
    };

    if (!hasPageBeenRendered.current.allUsersLoaded) {
      hasPageBeenRendered.current.allUsersLoaded = true;
      setFetchingUsers(true);
      fetchUsers();
    }
  }, []);

  const handleProductOrderChange = (data: any) => {
    const formValues = data._formValues;

    setProductOrder((prevOrder) => ({
      ...prevOrder!,
      productOrderNumber: formValues.productOrderDetails.productOrderNumber,
      referenceNumber: formValues.productOrderDetails.referenceNumber,
      lot: formValues.productOrderDetails.lot,
      externalProductOrderNumber:
        formValues.productOrderDetails.externalProductOrderNumber,
      assignedUser: formValues.productOrderDetails.assignedUser,
      siteRef: formValues.productOrderDetails.siteRef,
      provider: formValues.productOrderDetails.provider,
      client: formValues.productOrderDetails.client,
      createdDate: formValues.productOrderDetails.createdDate,
      invoiceDate: formValues.productOrderDetails.invoiceDate,
      quantity: formValues.productOrderDetails.quantity,
      product: formValues.productOrderDetails.product,
      description: formValues.productOrderDetails.description,
      notes: formValues.productOrderDetails.notes,
    }));
  };

  const handleNotesChange = (notes: Note[]) => {
    setProductOrder((prevOrder) => ({
      ...prevOrder!,
      notes: notes,
    }));
  };

  const handleActivityLogClick = (
    activityType: ActivityType,
    tracerStreamId = '',
  ) => {
    if (Array.isArray(allActivityLogs)) {
      const filteredLogs =
        activityType === ActivityType.StatusChange
          ? allActivityLogs.filter((log) => log.activityType === activityType)
          : allActivityLogs.filter(
              (log) =>
                log.activityType === activityType &&
                log.traceabilityStream === tracerStreamId,
            );
      setActivityLogsToDisplay(filteredLogs);
    } else {
      console.error('allActivityLogs is not an array', allActivityLogs);
    }
    setActivityLogType(activityType);
    setIsActivityLogOpen(true);
  };

  const handleDeleteProductOrder = async (orderToDelete: ProductOrder) => {
    if (!orderToDelete.id) {
      return;
    }
    if (poToDelete) {
      try {
        setIsLoading(true);
        await orderManagementApiProxy.deleteProductOrder(orderToDelete.id);
        notifyDelete();
      } catch (error) {
        console.error('Failed to delete Product Order', error);
        notifyDeleteError();
      } finally {
        setIsLoading(false);
      }
      setPoToDelete(null);
      setIsAlertModalOpen(false);
    }
  };

  const getChildrenPos = async (productOrderNumbers: string[]) => {
    const childrenPos = await Promise.all(
      productOrderNumbers.map((ref) =>
        orderManagementApiProxy.getProductOrder(ref),
      ),
    );
    SetChildrenPos(childrenPos);
  };

  const handleStatusChange = (newStatuses: TeamStatusExtended[]) => {
    setStatuses(newStatuses);
    if (productOrder) {
      setProductOrder({ ...productOrder, teamStatuses: newStatuses });
    }
  };

  const handleSectionClick = (
    section: SectionModel,
    stream: TracerStreamExtended,
  ) => {
    section.fileNameOnExport =
      section.fileNameOnExport === '' ? null : section.fileNameOnExport;
    section.assignedUser = section.assignedUser || null;
    setSelectedSection(section);
    setSelectedStream(stream);
    setIsSectionModalOpen(true);
  };

  const handleDeleteStream = (streamToDelete: TracerStreamExtended) => {
    if (streamToDeleteModal && productOrder) {
      const updatedStreams = productOrder.childrenTracerStreams.filter(
        (stream) => stream.id !== streamToDelete.id,
      );
      setProductOrder({
        ...productOrder,
        childrenTracerStreams: updatedStreams || [],
      });
      setStreamToDelete(null);
      setIsAlertModalOpenStream(false);
    }
  };

  const handleSiblingProductOrderChange = (newPOs: SiblingProductOrder[]) => {
    setProductOrder((prevOrder) => ({
      ...prevOrder!,
      siblingProductOrders: newPOs,
    }));
    setIsSiblingProductOrderModalOpen(false);
  };

  const handleSiblingProductOrderCancel = () => {
    setIsSiblingProductOrderModalOpen(false);
  };

  const handleStreamClick = (
    stream: TracerStreamExtended,
    mode: 'edit' | 'add',
  ) => {
    setSelectedStream(stream);
    setStreamModalMode(mode);
    setIsStreamModalOpen(true);
  };

  const nextSection = () => {
    if (!selectedStream || !productOrder) return;
    const currentIndex = selectedStream.sections.findIndex(
      (section) => section.sectionId === selectedSection?.sectionId,
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex < selectedStream.sections.length) {
      handleSectionClick(selectedStream.sections[nextIndex], selectedStream);
    }
  };

  const previousSection = () => {
    if (!selectedStream || !productOrder) return;
    const currentIndex = selectedStream.sections.findIndex(
      (section) => section.sectionId === selectedSection?.sectionId,
    );
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0) {
      handleSectionClick(
        selectedStream.sections[previousIndex],
        selectedStream,
      );
    }
  };

  const handleSaveSection = (
    updatedSection: SectionModel,
    move: 'Right' | 'Left' | null | undefined,
  ) => {
    setProductOrder((prevOrder) => {
      if (!prevOrder || !selectedStream) return null;

      const updatedStreams = prevOrder.childrenTracerStreams.map((stream) =>
        stream.id === selectedStream.id
          ? {
              ...stream,
              sections: stream.sections.some(
                (section) => section.sectionId === updatedSection.sectionId,
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
    if (move === 'Right') {
      nextSection();
    } else if (move === 'Left') {
      previousSection();
    } else {
      handleCloseSectionModal();
    }
  };

  const handleDeleteSection = (
    stream: TracerStreamExtended,
    section: SectionModel,
  ) => {
    console.log('Selected Stream:', stream);
    console.log('Section to delete:', section);
    if (sectionToDelete && productOrder) {
      const updatedStreams = productOrder.childrenTracerStreams.map((str) => {
        if (str.id) {
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
      setSectionToDelete(null);
      setIsAlertModalOpenSection(false);
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
  };

  const handleCloseActivityLogModal = () => {
    setIsActivityLogOpen(false);
    setActivityLogsToDisplay([]);
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

  const getUpdatedLogs = (productOrderRef: string) => {
    activityLogProxy.getActivityLogByPo(productOrderRef).then((logs) => {
      setAllActivityLogs(logs);
    });
  };

  const insertLogs = () => {
    productOrder?.teamStatuses.forEach((status) => {
      const originalStatus = originalProductOrder?.teamStatuses.find(
        (s) => s.id === status.id,
      );
      if (originalStatus?.selectedValue !== status.selectedValue) {
        const activityLog: ActivityLog = {
          productOrderReference: productOrder.id as string,
          activityType: 'Status Change',
          team: status.name,
          teamStatus: status.selectedValue,
          productOrderNumber: productOrder?.productOrderNumber || '',
          userFirstName: user?.firstName || '',
          userLastName: user?.lastname || '',
          timeStamp: new Date(),
          feedBack: status.selectedValue === 'Returned' ? status.feedback : '',
        };
        activityLogProxy.insertActivityLog(activityLog);

        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
          if (
            status.name === 'Planning' &&
            status.selectedValue === 'Completed'
          ) {
            emailService.sendPoUpdateEmailToAllUsers(
              productOrder?.productOrderNumber || '',
              'Planning',
              'Completed',
            );
          } else if (
            status.name === 'SAC' &&
            status.selectedValue === 'Returned'
          ) {
            emailService.sendPoUpdateEmailToAllUsers(
              productOrder?.productOrderNumber || '',
              'SAC',
              'Returned',
            );
          } else if (
            status.name === 'Planning' &&
            status.selectedValue === 'Accomplish'
          ) {
            emailService.sendPoUpdateEmailToAllUsers(
              productOrder?.productOrderNumber || '',
              'Planning',
              'Accomplish',
            );
          }
        }
      }
    });

    if (productOrder && originalProductOrder) {
      originalProductOrder.teamStatuses = productOrder.teamStatuses;
    }
  };

  const handleSave = async () => {
    if (productOrder) {
      try {
        setIsLoading(true);
        const response =
          await orderManagementApiProxy.updateProductOrder(productOrder);
        setIsLoading(false);
        if (response.status === 204) {
          activityLogService.insertLogs(productOrder, originalProductOrder);
          getUpdatedLogs(productOrder.id as string);
          router.push(`/dashboard/po/${productOrder.id as string}`);
          notify();
        } else {
          notifyError();
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to save Product Order', error);
        notifyError();
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
      <div className="container">
        <div>
          <Link
            href="/dashboard"
            className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
          >
            Dashboard
          </Link>
          <span className="text-sm text-gray-500"> &gt; PO Details</span>
        </div>
        <Section>
          <div className="tool-bar">
            <div className="tool-bar-title">
              <h1 className="text-3xl font-bold text-[var(--primary-color)]">
                Product Order Details
              </h1>
            </div>
            <div className="tool-bar-buttons">
              <TracerButton
                name="Add Tracer Stream"
                icon={<HiPlus />}
                onClick={() =>
                  handleStreamClick({} as TracerStreamExtended, 'add')
                }
              />
              <TracerButton
                name={`${siblingPoTextDisplay} Sibling Pos`}
                onClick={() => setIsSiblingProductOrderModalOpen(true)}
              />
              {isAdmin && (
                <button
                  onClick={() => {
                    setPoToDelete(productOrder);
                    setIsAlertModalOpen(true);
                  }}
                  className="border-1 border-red-500 bg-red-500 font-medium text-white hover:bg-red-400 hover:text-white"
                  style={{ borderRadius: '10px 10px 10px 10px' }}
                >
                  <div className="flex flex-row align-middle">
                    <div className="pe-1 pt-1">
                      <FaTrash color="white" />
                    </div>
                    <p> Delete PO </p>
                  </div>
                </button>
              )}
            </div>
          </div>
          <div
            className="my-4 mt-3 w-full border-b-4"
            style={{ borderColor: 'var(--primary-color)' }}
          ></div>
          <div className="mt-3">
            <ProductOrderDetails
              initialProductOrderDetails={productOrder}
              onChange={handleProductOrderChange}
            />
          </div>

          <div className="my-4">
            <div className="row flex gap-10">
              <Notes
                notes={productOrder.notes}
                currentUser={currentUser}
                onChange={handleNotesChange}
              />
              <TeamStatuses
                originalStatuses={statuses}
                onChange={handleStatusChange}
                disableHistoryButton={!allActivityLogs.length}
                onHistoryClick={() =>
                  handleActivityLogClick(ActivityType.StatusChange)
                }
              />
            </div>
          </div>

          <div style={{ marginBottom: '10rem' }}>
            <h1>Production Tiers</h1>
            <TiersComponent tiers={tiersData} />
          </div>

          {/* <CardContainer>
            {productOrder.childrenTracerStreams.map((stream, index) => (
              <TraceabilityStreamComponent
                key={stream.id}
                stream={stream}
                onSectionSave={(updatedSection) =>
                  handleSaveSection(updatedSection, null)
                }
                onSectionDelete={(section) => {
                  setSectionToDelete(section);
                  setIsAlertModalOpenSection(true);
                }}
                allActivityLogs={[]}
                onActivityLogClick={function (
                  activityType: string,
                  streamId: string,
                ): void {
                  throw new Error('Function not implemented.');
                }}
                onExportClick={function (stream: TracerStreamExtended): void {
                  throw new Error('Function not implemented.');
                }}
                onEditStream={function (
                  stream: TracerStreamExtended,
                  mode: 'edit' | 'add',
                ): void {
                  throw new Error('Function not implemented.');
                }}
                onDeleteStream={function (stream: TracerStreamExtended): void {
                  throw new Error('Function not implemented.');
                }}
              />
            ))}
          </CardContainer> */}

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
                    <Link href={`/dashboard/po/${po.productOrderNumber}`}>
                      <p className="">View Details</p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>
      <footer
        className="stream-footer flex justify-between bg-gray-200 p-4"
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        <div>
          <button
            className="rounded-md border border-white bg-none px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleSave();
            }}
            className="ml-3 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <Toaster />
        </div>
      </footer>
      {isStreamModalOpen && selectedStream && (
        <TracerStreamModal
          originalTracerStream={
            streamModalMode === 'edit' ? selectedStream : null
          }
          isOpen={isStreamModalOpen}
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
          isOpen={isExportModalOpen}
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
      {isActivityLogOpen && (
        <ActivityLogModal
          activityLogs={activityLogsToDisplay}
          displayType={activityLogType}
          onClose={handleCloseActivityLogModal}
        />
      )}
      {isSiblingProductOrderModalOpen && (
        <SiblingProductOrdersModal
          initialSiblingProductOrders={productOrder.siblingProductOrders || []}
          onClose={handleSiblingProductOrderCancel}
          onSave={handleSiblingProductOrderChange}
        />
      )}
      {isAlertModalOpen && (
        <AlertModal
          isOpen={isAlertModalOpen}
          type="delete"
          title="Delete Product Order"
          message="Are you sure you want to delete this product order?"
          icon={<FaTrash className="h-6 w-6 text-red-500" />}
          onClose={() => {
            setIsAlertModalOpen(false);
            setPoToDelete(null);
          }}
          onConfirm={() => {
            handleDeleteProductOrder(poToDelete as ProductOrder);
            notifyDelete();
            router.push('/dashboard');
          }}
        />
      )}
      {isAlertModalOpenStream && (
        <AlertModal
          isOpen={isAlertModalOpenStream}
          type="delete"
          title="Delete Tracer Stream"
          message="Are you sure you want to delete this tracer stream?"
          icon={<FaTrash className="h-6 w-6 text-red-500" />}
          onClose={() => {
            setIsAlertModalOpenStream(false);
            setStreamToDelete(null);
          }}
          onConfirm={() => {
            handleDeleteStream(streamToDeleteModal as TracerStreamExtended);
            notifyDeleteStream();
          }}
        />
      )}
      {isAlertModalOpenSection && (
        <AlertModal
          isOpen={isAlertModalOpenSection}
          type="delete"
          title="Delete Section"
          message="Are you sure you want to delete this section?"
          icon={<FaTrash className="h-6 w-6 text-red-500" />}
          onClose={() => {
            setIsAlertModalOpenSection(false);
            setSectionToDelete(null);
          }}
          onConfirm={() => {
            handleDeleteSection(
              selectedStream as TracerStreamExtended,
              sectionToDelete as SectionModel,
            );
            notifyDeleteSection();
          }}
        />
      )}
    </Layout>
  );
};

export default withAuth(PurchaseOrderPage);

const Section = styled.section`
  margin-bottom: 40px;
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

const CardDetails = styled.div`
  font-size: 14px;
`;

const DetailItem = styled.div`
  margin-bottom: 16px;
`;

const AddNewButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  background-color: var(--primary-button);
  color: white;
  transition: background-color 0.3s ease;
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

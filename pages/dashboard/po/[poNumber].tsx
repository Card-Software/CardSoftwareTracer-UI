import React, { useState, useEffect, useRef } from 'react';
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
  FaHistory,
} from 'react-icons/fa';
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
import { Status } from '@/models/status'; // Import Status
import { v4 as uuidv4 } from 'uuid';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import ExportModal from '@/components/modals/export-modal.component';
import { Site } from '@/models/site';
import { activityLogProxy } from '@/proxies/activity-log.proxy';
import { ActivityLog } from '@/models/activity-log';
import ActivityLogModal from '@/components/modals/activity-log-modal.component';
import { ActivityType } from '@/models/enum/activity-type';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Group } from '@/models/group';
import { emailService } from '@/services/email.service';
import SiblingProductOrdersModal from '@/components/modals/sibling-product-orders-modal.component';
import { SiblingProductOrder } from '@/models/sibling-product-order';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;
  const user = userAuthenticationService.getUser() as User;
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

  const groups: Group[] = userAuthenticationService.getGroups();
  const isAdmin = user.role.includes('Admin');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (poNumber) {
        setIsLoading(true);

        const order = await orderManagementApiProxy.getProductOrder(
          poNumber as string,
        );

        setOriginalProductOrder(order);

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

        activityLogProxy
          .getActivityLogByPo(order.productOrderNumber)
          .then((logs) => {
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
          setLinkedOrders(linkedOrderDetails);
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

  const handleActivityLogClick = (
    activityType: ActivityType,
    tracerStreamId = '',
  ) => {
    // Check if allActivityLogs is an array
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

  const handleActivityLogClose = () => {
    setIsActivityLogOpen(false);
    setActivityLogsToDisplay([]);
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

  const handleDeleteProductOrder = async (orderToDelete: ProductOrder) => {
    if (!orderToDelete.id) {
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product order?',
    );
    if (confirmDelete) {
      try {
        setIsLoading(true);
        await orderManagementApiProxy.deleteProductOrder(orderToDelete.id);
        alert('Product Order deleted successfully!');
      } catch (error) {
        console.error('Failed to delete Product Order', error);
        alert('Failed to delete Product Order');
      } finally {
        setIsLoading(false);
      }
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

  const isExportEnabled = (stream: TracerStreamExtended) => {
    const requiredSections = stream.sections.filter(
      (section) => section.isRequired,
    );
    return requiredSections.every((section) => section.files.length > 0);
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

  const getUpdatedLogs = (productOrderNumber: string) => {
    activityLogProxy.getActivityLogByPo(productOrderNumber).then((logs) => {
      setAllActivityLogs(logs);
    });
  };

  const insertLogs = () => {
    productOrder?.statuses.forEach((status) => {
      const originalStatus = originalProductOrder?.statuses.find(
        (s) => s.team === status.team,
      );
      if (originalStatus?.teamStatus !== status.teamStatus) {
        const activityLog: ActivityLog = {
          activityType: 'Status Change',
          team: status.team,
          teamStatus: status.teamStatus,
          productOrderNumber: productOrder?.productOrderNumber || '',
          userFirstName: user?.firstName || '',
          userLastName: user?.lastname || '',
          timeStamp: new Date(),
          feedBack: status.teamStatus === 'Returned' ? status.feedback : '',
        };
        activityLogProxy.insertActivityLog(activityLog);

        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
          if (status.team === 'Planning' && status.teamStatus === 'Completed') {
            emailService.sendPoUpdateEmailToAllUsers(
              productOrder?.productOrderNumber || '',
              'Planning',
              'Completed',
            );
          } else if (
            status.team === 'SAC' &&
            status.teamStatus === 'Returned'
          ) {
            emailService.sendPoUpdateEmailToAllUsers(
              productOrder?.productOrderNumber || '',
              'SAC',
              'Returned',
            );
          } else if (
            status.team === 'Planning' &&
            status.teamStatus === 'Accomplish'
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
      originalProductOrder.statuses = productOrder.statuses;
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
          insertLogs();
          getUpdatedLogs(productOrder.productOrderNumber);
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
          <div className="mb-5 flex flex-row items-center">
            <div className="me-8 text-xl">
              <h1>Product Order Details</h1>
            </div>
            <div className="flex flex-row flex-nowrap space-x-4">
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
            </div>
            {isAdmin && (
              <div className="pl-2">
                <button
                  onClick={async () => {
                    await handleDeleteProductOrder(productOrder);
                    router.push('/Dashboard');
                  }}
                  className="rounded border-2 border-red-500 px-4 py-2 font-medium text-black hover:bg-red-500 hover:text-white"
                >
                  Delete PO
                </button>
              </div>
            )}
          </div>

          <div className="space-between mb-4 flex gap-5">
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Product Order
              </label>
              <span className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900">
                {productOrder.productOrderNumber}
              </span>
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Reference
              </label>
              <input
                type="text"
                id="referenceNumber"
                name="referenceNumber"
                value={productOrder.referenceNumber}
                onChange={handleProductOrderChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Lot
              </label>
              <input
                type="text"
                id="lot"
                name="lot"
                value={productOrder.lot}
                onChange={handleProductOrderChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                External Product Order
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
                Provider
              </label>
              <input
                type="text"
                id="provider"
                name="provider"
                value={productOrder.provider}
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
            <div>
              <label
                htmlFor="createdDate"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Date Created
              </label>
              <DatePicker
                id="createdDate"
                name="createdDate"
                selected={productOrder.createdDate}
                onChange={(e) =>
                  setProductOrder({ ...productOrder, createdDate: e as Date })
                }
                className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div>
              <label
                htmlFor="invoiceDate"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Invoice Date
              </label>
              <DatePicker
                selected={productOrder.invoiceDate}
                onChange={(e) =>
                  setProductOrder({ ...productOrder, invoiceDate: e as Date })
                }
                className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
          <div className="space-between mb-4 flex gap-5">
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
            <div className="form-box">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Product
              </label>
              <input
                type="text"
                id="product"
                name="product"
                value={productOrder.product}
                onChange={handleProductOrderChange}
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
            <button
              className="mb-2 rounded bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-600"
              disabled={!allActivityLogs.length}
              onClick={() => handleActivityLogClick(ActivityType.StatusChange)}
              style={{
                opacity: allActivityLogs.length === 0 ? 0.5 : 1,
                cursor:
                  allActivityLogs.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <FaHistory />
            </button>

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
                      <div className="flex max-h-14">
                        <button
                          disabled={!allActivityLogs.length}
                          className="mb-2 rounded bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-600"
                          onClick={(e) => {
                            handleActivityLogClick(
                              ActivityType.FileUpload,
                              stream.id,
                            );
                          }}
                        >
                          <FaHistory />
                        </button>
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
          onSave={handleSaveSection}
          mode={
            selectedSection.sectionId
              ? 'edit'
              : 'sectionCreationOnExistingTracer'
          }
          totalSections={selectedStream.sections.length}
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
    </Layout>
  );
};

export default withAuth(PurchaseOrderPage);

const Container = styled.div`
  padding: 10px;
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
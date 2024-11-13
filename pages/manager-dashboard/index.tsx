import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/app/layout';
import TracerButton from '@/components/tracer-button.component';
import { HiPlus, HiFilter, HiArrowUp } from 'react-icons/hi';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import withAuth from '@/hoc/auth';
import LoadingOverlay from '@/components/loading-overlay.component';
import { PoSearchFilters } from '@/models/po-search-filter';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { Site } from '@/models/site';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import { FaFileExport } from 'react-icons/fa';
import { ProductOrderSnapshot } from '@/models/product-order-snapshot';
import { SnapshotPaginatedResult } from '@/models/snapshot-paginated-result';
import ArrayModal from '@/components/modals/table-modal.component';
import { fileManagementApiProxy } from '@/proxies/file-management.proxy';
import { TeamStatus } from '@/models/team-status';
import { teamStatusProxy } from '@/proxies/team-status.proxy';

const ManagerDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<string[]>([]);

  const truncateArray = (array: string[], limit: number) => {
    if (array.length <= limit) return array;
    return array.slice(0, limit).concat(`...and ${array.length - limit} more`);
  };

  const handleOpenModal = (title: string, data: string[]) => {
    setModalTitle(title);
    setModalData(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalData([]);
  };
  const hasPageBeenRendered = useRef(false); // Track initial render
  const isLoadingRef = useRef(false); // Track loading state
  const router = useRouter();
  const [productOrders, setProductOrders] = useState<ProductOrderSnapshot[]>([]);
  const [filteredProductOrders, setFilteredProductOrders] = useState<ProductOrderSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

  const [filterValues, setFilterValues] = useState<PoSearchFilters>({
    productOrderNumber: null,
    externalPoNumber: null,
    referenceNumber: null,
    startDate: null,
    endDate: null,
    siteRef: null,
    planningStatus: null,
    ntStatus: null,
    sacStatus: null,
    assignedUserRef: null,
    pageSize: 50,
    pageNumber: 1,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      console.log('scrolling to top');
    }
  };
  const [allStatuses, setAllStatuses] = useState<TeamStatus[]>([]);
  const [pageSize, setPageSize] = useState<number>(50);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const bucketName = userAuthenticationService.getOrganization()?.s3BucketName as string;

  const handleNewProductOrder = () => {
    router.push('/dashboard/new-product-order');
  };

  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    if (organization) {
      setAllSites(organization.sites || []);
      setAllUsers(organization.users || []);
    }

    const fetchData = async () => {
      try {
        const statuses = await teamStatusProxy.getAllTeamStatus();
        setAllStatuses(statuses);
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      }
    };
    fetchData();
  }, []);

  // Handle query parameters and filter initialization
  useEffect(() => {
    if (!router.isReady) return; // Wait for the route to be ready
    const { query } = router;

    const getStringValue = (value: string | string[] | undefined): string =>
      Array.isArray(value) ? value[0] || '' : value || '';

    // Extract initial filters from the query params
    const initialFilters = {
      productOrderNumber: getStringValue(query.productOrderNumber),
      externalPoNumber: getStringValue(query.externalPoNumber),
      referenceNumber: getStringValue(query.referenceNumber),
      startDate: query.startDate ? moment(getStringValue(query.startDate)) : null,
      endDate: query.endDate ? moment(getStringValue(query.endDate)) : null,
      siteRef: getStringValue(query.siteRef),
      planningStatus: getStringValue(query.planningStatus),
      ntStatus: getStringValue(query.ntStatus),
      sacStatus: getStringValue(query.sacStatus),
      assignedUserRef: getStringValue(query.assignedUserRef),
      pageSize: Number(query.pageSize) || 50,
      pageNumber: Number(query.pageNumber) || 1,
    };

    // Only set filterValues if the page has not been rendered before
    if (!hasPageBeenRendered.current) {
      setFilterValues(initialFilters);
      fetchProductOrders(initialFilters);
      hasPageBeenRendered.current = true;
      return;
    }

    if (isLoadingRef.current) return;

    // fetchProductOrders(filterValues);
  }, [router.isReady, router.query]);

  // Fetch product orders with filters
  const fetchProductOrders = async (filters: PoSearchFilters) => {
    try {
      setIsLoading(true);
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      if (isLoading) return;
      const response: SnapshotPaginatedResult = await orderManagementApiProxy.searchProductOrdersSnapshots(filters);
      if (response.results.length === 0) {
        // Clear old results if no new results are found
        setProductOrders([]);
        setFilteredProductOrders([]);
        setTotalResults(0);
      } else {
        // Sort the results and update the state
        const sortedResults = response.results.sort((a, b) => {
          if (a.createdDate && b.createdDate) {
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          }
          return 0;
        });
        setProductOrders(sortedResults);
        setFilteredProductOrders(sortedResults);
        setTotalResults(response.totalResults);
      }
    } catch (error) {
      console.error('Failed to fetch product orders:', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Update query params when filters or pagination change
  useEffect(() => {
    if (!router.isReady || !hasPageBeenRendered.current) return;

    const query: { [key: string]: string | number } = {};

    Object.keys(filterValues).forEach((key) => {
      const value = filterValues[key as keyof PoSearchFilters];
      if (value !== null && value !== '') {
        query[key] = typeof value === 'object' && value.toISOString ? value.toISOString() : String(value);
      }
    });

    query.pageSize = pageSize;
    query.pageNumber = pageNumber;

    router.replace({ pathname: router.pathname, query });
  }, [filterValues, pageSize, pageNumber]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilterValues({
      ...filterValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFilterValues({
      ...filterValues,
      [name]: date ? moment(date) : null,
    });
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = allUsers.find((u) => u.id === e.target.value);
    if (user) {
      setFilterValues({
        ...filterValues,
        assignedUserRef: user.id || '',
      });
    } else {
      setFilterValues({
        ...filterValues,
        assignedUserRef: '',
      });
    }
  };

  const clearFilters = () => {
    setFilterValues({
      productOrderNumber: null,
      externalPoNumber: null,
      referenceNumber: null,
      startDate: null,
      endDate: null,
      siteRef: null,
      planningStatus: null,
      ntStatus: null,
      sacStatus: null,
      assignedUserRef: null,
      pageSize: 50,
      pageNumber: 1,
    });
    //clear query params
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true },
    );
  };

  const applyFilters = () => {
    const usedFilters = Object.entries(filterValues)
      .filter(([key, value]) => value !== '' && value !== null)
      .reduce((acc: { [key: string]: any }, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const query = {
      ...usedFilters,
      startDate: filterValues.startDate ? filterValues.startDate.format('YYYY-MM-DD') : '',
      endDate: filterValues.endDate ? filterValues.endDate.format('YYYY-MM-DD') : '',
    };

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true },
    );

    setFilterValues(filterValues);
    setPageNumber(1); // Reset to first page when applying filters
  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
  };

  const handleRowClick = (productOrderNumber: string) => {
    if (!isModalOpen) {
      router.push(`/dashboard/po/${productOrderNumber}`);
    }
  };

  const convertDateToInternationalDateString = (date: string | Date) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
      return '';
    }
    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleExportToXlsx = async () => {
    try {
      setIsLoading(true);

      // Call the proxy function to get the Excel file as a Blob
      const result = await orderManagementApiProxy.uploadSnapshotSearchToS3(filterValues);

      const prefix = result[0];

      const file = await fileManagementApiProxy.getAllFiles(bucketName, prefix);

      window.open(file[0].presignedUrl, '_blank');

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to export to XLSX:', error);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const [sortedOrders, setSortedOrders] = useState(filteredProductOrders);

  useEffect(() => {
    if (!sortConfig || filteredProductOrders.length === 0) {
      setSortedOrders(filteredProductOrders);
      return;
    }

    const sorted = [...filteredProductOrders].sort((a, b) => {
      const key = sortConfig.key as keyof ProductOrderSnapshot;
      const aValue = a[key];
      const bValue = b[key];

      // Prioritize date fields before null checks
      if (['createdDate', 'invoiceDate'].includes(key as string)) {
        const dateA = aValue ? new Date(aValue as string).getTime() : null;
        const dateB = bValue ? new Date(bValue as string).getTime() : null;

        // Handle null date values based on sort direction
        if (sortConfig.direction === 'descending') {
          if (dateA === null) return 1; // Nulls go to the bottom in descending order
          if (dateB === null) return -1; // Nulls go to the bottom in descending order
        }

        if (sortConfig.direction === 'ascending') {
          if (dateA === null) return -1; // Nulls stay at the top in ascending order
          if (dateB === null) return 1; // Nulls stay at the top in ascending order
        }

        // Both dates are non-null, so we compare normally
        if (dateA !== null && dateB !== null) {
          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
      }

      // Handle strings with localeCompare
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      // For other value types (numbers, etc.)
      if (aValue === undefined && bValue !== undefined) {
        return sortConfig.direction === 'ascending' ? 1 : -1; // undefined goes to the bottom
      }
      if (aValue !== undefined && bValue === undefined) {
        return sortConfig.direction === 'ascending' ? -1 : 1; // undefined goes to the top
      }

      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      }

      // If both are undefined or equal
      return 0;
    });

    setSortedOrders(sorted);
  }, [sortConfig]);

  useEffect(() => {
    setFilteredProductOrders(sortedOrders);
  }, [sortedOrders]);

  const getStatusByName = (name: string) => {
    return allStatuses.find((status) => status.name === name);
  };

  return (
    <>
      <Layout>
        <LoadingOverlay show={isLoading} />
        <div className="content max-w-fit">
          <div aria-label="Toolbar">
            <div className="tool-bar-content mr-6">
              <div className="row">
                <h1>Managers Dashboard</h1>
                <div className="mt-3">Total Results: {totalResults}</div>
              </div>

              <div className="row">
                <div>
                  <TracerButton name="Add New PO" icon={<HiPlus />} onClick={handleNewProductOrder} />
                </div>
                <div>
                  <TracerButton name="Export" icon={<FaFileExport />} onClick={handleExportToXlsx} />
                </div>

                <button
                  onClick={toggleFilterVisibility}
                  className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  <HiFilter className="mr-2 inline-block" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          {isFilterVisible && (
            <div className="my-6 rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="productOrderName" className="block text-sm font-medium text-gray-700">
                    Product Order
                  </label>
                  <input
                    type="text"
                    name="productOrderNumber"
                    id="productOrderName"
                    value={filterValues.productOrderNumber || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  />
                </div>
                <div>
                  <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    id="referenceNumber"
                    value={filterValues.referenceNumber || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  />
                </div>
                <div>
                  <label htmlFor="externalPoNumber" className="block text-sm font-medium text-gray-700">
                    External Product Order
                  </label>
                  <input
                    type="text"
                    name="externalPoNumber"
                    id="externalPoNumber"
                    value={filterValues.externalPoNumber || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  />
                </div>
                <div>
                  <label htmlFor="assignedUserRef" className="block text-sm font-medium text-gray-700">
                    User
                  </label>
                  <select
                    name="assignedUserRef"
                    id="assignedUserRef"
                    value={filterValues.assignedUserRef || ''}
                    onChange={handleUserChange}
                    className="mt-2 w-full p-1"
                  >
                    <option value="">Select an associate</option>
                    {allUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <DatePicker
                    selected={filterValues.startDate ? filterValues.startDate.toDate() : null}
                    onChange={(date) => handleDateChange('startDate', date)}
                    className="mt-2 w-full p-1"
                    dateFormat="yyyy/MM/dd"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <DatePicker
                    selected={filterValues.endDate ? filterValues.endDate.toDate() : null}
                    onChange={(date) => handleDateChange('endDate', date)}
                    className="mt-2 w-full p-1"
                    dateFormat="yyyy/MM/dd"
                  />
                </div>
                <div>
                  <label htmlFor="siteRef" className="block text-sm font-medium text-gray-700">
                    Site
                  </label>
                  <select
                    name="siteRef"
                    id="siteRef"
                    value={filterValues.siteRef || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  >
                    <option value="">Select an site</option>
                    {allSites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="planningStatus" className="block text-sm font-medium text-gray-700">
                    Planning Status
                  </label>
                  <select
                    name="planningStatus"
                    id="planningStatus"
                    value={filterValues.planningStatus || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  >
                    <option value="">Select Status</option>
                    {getStatusByName('Planning')?.possibleValues.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ntStatus" className="block text-sm font-medium text-gray-700">
                    NT Status
                  </label>
                  <select
                    name="ntStatus"
                    id="ntStatus"
                    value={filterValues.ntStatus || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  >
                    <option value="">Select Status</option>
                    {getStatusByName('NT')?.possibleValues.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sacStatus" className="block text-sm font-medium text-gray-700">
                    SAC Status
                  </label>
                  <select
                    name="sacStatus"
                    id="sacStatus"
                    value={filterValues.sacStatus || ''}
                    onChange={handleFilterChange}
                    className="mt-2 w-full p-1"
                  >
                    <option value="">Select Status</option>
                    {getStatusByName('SAC')?.possibleValues.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  <button onClick={clearFilters} style={{ borderRadius: '10px 10px 10px 10px' }} className="clearAll">
                    Clear All
                  </button>
                  <TracerButton type="button" name="Apply Filter" onClick={() => fetchProductOrders(filterValues)} />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-row items-start justify-start">
            <div className="h-[calc(100vh-200px)] w-full max-w-screen-xl">
              <div className="mr-5 max-h-[555px] overflow-y-auto" ref={tableContainerRef}>
                <table className="standard-table">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th scope="col" onClick={() => handleSort('productOrderNumber')}>
                        Product Order Number
                      </th>
                      <th scope="col" onClick={() => handleSort('externalProductOrderNumber')}>
                        External Product Order
                      </th>
                      <th scope="col" onClick={() => handleSort('referenceNumber')}>
                        Reference Number
                      </th>
                      <th scope="col" onClick={() => handleSort('lot')}>
                        Lot
                      </th>
                      <th scope="col" onClick={() => handleSort('quantity')}>
                        Quantity
                      </th>
                      <th scope="col" onClick={() => handleSort('product')}>
                        Product
                      </th>
                      <th scope="col">User</th>
                      <th scope="col" onClick={() => handleSort('siteRef')}>
                        Site
                      </th>
                      <th scope="col" onClick={() => handleSort('createdDate')}>
                        Date Created
                      </th>
                      <th scope="col" onClick={() => handleSort('invoiceDate')}>
                        Invoice Date
                      </th>
                      <th scope="col" onClick={() => handleSort('planningCompletion')}>
                        Planning Completion
                      </th>
                      <th scope="col" onClick={() => handleSort('planningStatus')}>
                        Planning Status
                      </th>
                      <th scope="col">Planning Missing</th>
                      <th scope="col" onClick={() => handleSort('ntCompletion')}>
                        NT Completion
                      </th>
                      <th scope="col" onClick={() => handleSort('ntStatus')}>
                        NT Status
                      </th>
                      <th scope="col">NT Missing</th>
                      <th scope="col" onClick={() => handleSort('sacCompletion')}>
                        SAC Completion
                      </th>
                      <th scope="col" onClick={() => handleSort('sacStatus')}>
                        SAC Status
                      </th>
                      <th scope="col">SAC Missing</th>
                    </tr>
                  </thead>
                  <tbody className="cursor-pointer divide-y divide-gray-200 bg-white">
                    {filteredProductOrders.length > 0 ? (
                      filteredProductOrders.map((order, index) => {
                        return (
                          <tr key={order.id}>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {order.productOrderNumber}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {order.externalProductOrderNumber}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.referenceNumber}</td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.lot}</td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.quantity}</td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.product}</td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {allUsers.find((user) => user.id === order.assignedUserRef)
                                ? `${allUsers.find((user) => user.id === order.assignedUserRef)?.firstName} 
                        ${allUsers.find((user) => user.id === order.assignedUserRef)?.lastname}`
                                : ''}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {allSites.find((site) => site.id === order.siteRef)?.name}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {convertDateToInternationalDateString(order.createdDate)}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {convertDateToInternationalDateString(order.invoiceDate || '')}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>
                              {order.planningCompletion}%
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.planningStatus}</td>
                            <td
                              onClick={() =>
                                handleOpenModal('Planning Missing Sections', order.planningMissingSections || [])
                              }
                            >
                              {Array.isArray(order.planningMissingSections) &&
                              order.planningMissingSections.length > 0 ? (
                                <ul>
                                  {truncateArray(order.planningMissingSections, 2).map((section, index) => (
                                    <li className="whitespace-nowrap px-6 py-4 text-sm text-gray-500" key={index}>
                                      {section}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">No missing sections</p>
                              )}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.ntCompletion}%</td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.ntStatus}</td>
                            <td
                              onClick={() =>
                                handleOpenModal('Planning Missing Sections', order.ntMissingSections || [])
                              }
                            >
                              {Array.isArray(order.ntMissingSections) && order.ntMissingSections.length > 0 ? (
                                <ul>
                                  {truncateArray(order.ntMissingSections, 2).map((section, index) => (
                                    <li className="whitespace-nowrap px-6 py-4 text-sm text-gray-500" key={index}>
                                      {section}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">No missing sections</p>
                              )}
                            </td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.sacCompletion}%</td>
                            <td onClick={() => handleRowClick(order.productOrderReference)}>{order.sacStatus}</td>
                            <td
                              onClick={() =>
                                handleOpenModal('Planning Missing Sections', order.sacMissingSections || [])
                              }
                            >
                              {Array.isArray(order.sacMissingSections) && order.sacMissingSections.length > 0 ? (
                                <ul>
                                  {truncateArray(order.sacMissingSections, 2).map((section, index) => (
                                    <li className="whitespace-nowrap px-6 py-4 text-sm text-gray-500" key={index}>
                                      {section}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">No missing sections</p>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={12} className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                          No product orders available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={scrollToTop}
                className="fixed bottom-4 right-4 mb-5 mr-7 rounded-full bg-[var(--primary-button)] p-3 text-white shadow-lg hover:bg-[var(--primary-button-hover)]"
              >
                <HiArrowUp className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default withAuth(ManagerDashboard);

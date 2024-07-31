import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/dashboard.css';
import TracerButton from '@/components/TracerButton';
import { HiPlus, HiFilter, HiArrowUp } from 'react-icons/hi';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import withAuth from '@/hoc/auth';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AllResponse } from '@/models/AllResponse';
import { PoSearchFilters } from '@/models/PoSearchFilters';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { Statuses } from '@/models/enum/statuses';
import { Site } from '@/models/Site';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import { User } from '@/models/User';
import { reportsService } from '@/services/Reports.service';
import { FaFileExport } from 'react-icons/fa';
import { ProductOrderSnapshot } from '@/models/ProductOrderSnapshot';
import { SnapshotPaginatedResult } from '@/models/SnapshotPaginatedResult';
import * as XLSX from 'xlsx';
const ManagerDashboard: React.FC = () => {
  const router = useRouter();
  const [productOrders, setProductOrders] = useState<ProductOrderSnapshot[]>(
    [],
  );
  const [filteredProductOrders, setFilteredProductOrders] = useState<
    ProductOrderSnapshot[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

  const [filterInputs, setFilterInputs] = useState<PoSearchFilters>({
    productOrderNumber: '',
    externalPoNumber: '',
    startDate: null,
    endDate: null,
    siteRef: '',
    planningStatus: '',
    ntStatus: '',
    sacStatus: '',
    assignedUserRef: '',
  });

  const [filterValues, setFilterValues] = useState<PoSearchFilters>({
    productOrderNumber: '',
    externalPoNumber: '',
    startDate: null,
    endDate: null,
    siteRef: '',
    planningStatus: '',
    ntStatus: '',
    sacStatus: '',
    assignedUserRef: '',
  });

  const tableContainerRef = useRef(null);

  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const [pageSize, setPageSize] = useState<number>(50);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const handleNewProductOrder = () => {
    router.push('/Dashboard/NewProductOrder');
  };

  useEffect(() => {
    if (!router.isReady) return;
    const { query } = router;

    const getStringValue = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) {
        return value[0] || '';
      }
      return value || '';
    };

    const initialFilters = {
      productOrderNumber: getStringValue(query.productOrderNumber),
      externalPoNumber: getStringValue(query.externalPoNumber),
      startDate: query.startDate
        ? moment(getStringValue(query.startDate))
        : null,
      endDate: query.endDate ? moment(getStringValue(query.endDate)) : null,
      siteRef: getStringValue(query.siteRef),
      planningStatus: getStringValue(query.planningStatus),
      ntStatus: getStringValue(query.ntStatus),
      sacStatus: getStringValue(query.sacStatus),
      assignedUserRef: getStringValue(query.assignedUserRef),
    };

    setFilterInputs(initialFilters);
    setFilterValues(initialFilters);
    fetchProductOrders(initialFilters);
  }, [router.query]);

  // get all sites
  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    if (!organization) {
      return;
    }
    setAllSites(organization.sites || []);
    setAllUsers(organization.users || []);
  }, []);

  const fetchProductOrders = (filters: PoSearchFilters) => {
    const fetchProductOrders = async () => {
      try {
        setIsLoading(true);
        const response: SnapshotPaginatedResult =
          await orderManagementApiProxy.searchProductOrdersSnapshots(filters);
        response.results.sort((a, b) => {
          if (a.createdDate < b.createdDate) {
            return 1;
          }
          if (a.createdDate > b.createdDate) {
            return -1;
          }
          return 0; // Add default return value of 0
        });
        setProductOrders(response.results);
        setFilteredProductOrders(response.results);
        setTotalResults(response.totalResults);
      } catch (error) {
        console.error('Failed to fetch product orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductOrders();
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilterInputs({
      ...filterInputs,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFilterInputs({
      ...filterInputs,
      [name]: date ? moment(date) : null,
    });
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = allUsers.find((u) => u.id === e.target.value);
    if (user) {
      setFilterInputs({
        ...filterInputs,
        assignedUserRef: user.id || '',
      });
    } else {
      setFilterInputs({
        ...filterInputs,
        assignedUserRef: '',
      });
    }
  };

  const clearFilters = () => {
    setFilterValues({
      productOrderNumber: '',
      externalPoNumber: '',
      startDate: null,
      endDate: null,
      siteRef: '',
      planningStatus: '',
      ntStatus: '',
      sacStatus: '',
      assignedUserRef: '',
    });

    setFilterInputs({
      productOrderNumber: '',
      externalPoNumber: '',
      startDate: null,
      endDate: null,
      siteRef: '',
      planningStatus: '',
      ntStatus: '',
      sacStatus: '',
      assignedUserRef: '',
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
    const usedFilters = Object.entries(filterInputs)
      .filter(([key, value]) => value !== '' && value !== null)
      .reduce((acc: { [key: string]: any }, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const query = {
      ...usedFilters,
      startDate: filterInputs.startDate
        ? filterInputs.startDate.format('YYYY-MM-DD')
        : '',
      endDate: filterInputs.endDate
        ? filterInputs.endDate.format('YYYY-MM-DD')
        : '',
    };

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true },
    );

    setFilterValues(filterInputs);
    setPageNumber(1); // Reset to first page when applying filters
  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
  };

  const handleRowClick = (productOrderNumber: string) => {
    router.push(`/Dashboard/po/${productOrderNumber}`);
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
      const blob =
        await orderManagementApiProxy.convertSearchToCsv(filterValues);
      const url = window.URL.createObjectURL(blob);
      const response = await fetch(url);
      const csvText = await response.text();

      // Parse CSV text to a worksheet
      const csvArray = csvText.split('\n').map((row) => row.split(','));
      const worksheet = XLSX.utils.aoa_to_sheet(csvArray);

      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const xlsxBlob = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // Create a download link for the XLSX file
      const xlsxUrl = window.URL.createObjectURL(
        new Blob([xlsxBlob], { type: 'application/octet-stream' }),
      );
      const a = document.createElement('a');
      a.href = xlsxUrl;
      setIsLoading(false);
      a.download = 'Report.xlsx';
      a.click();
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to export to XLSX:', error);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProductOrders = React.useMemo(() => {
    const sortKeys = [
      'productOrderNumber',
      'externalProductOrderNumber',
      'siteRef',
      'createdDate',
      'planningCompletion',
      'planningStatus',
      'ntCompletion',
      'ntStatus',
      'sacCompletion',
      'sacStatus',
    ] as const;

    type SortKey = (typeof sortKeys)[number];

    function isSortKey(key: string): key is SortKey {
      return sortKeys.includes(key as SortKey);
    }

    if (sortConfig !== null && isSortKey(sortConfig.key)) {
      const sortedOrders = [...filteredProductOrders].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ProductOrderSnapshot] ?? ''; // Add nullish coalescing operator
        const bValue = b[sortConfig.key as keyof ProductOrderSnapshot] ?? ''; // Add nullish coalescing operator

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      return sortedOrders;
    }
    return filteredProductOrders;
  }, [filteredProductOrders, sortConfig]);

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="flex flex-row items-center">
        <div className="me-8 text-xl">
          <h1>Managers Dashboard</h1>
        </div>
        <div>
          <TracerButton
            name="Add New PO"
            icon={<HiPlus />}
            onClick={handleNewProductOrder}
          />
        </div>
        <div className="ml-3">
          <TracerButton
            name="Export"
            icon={<FaFileExport />}
            onClick={handleExportToXlsx}
          />
        </div>
        <div className="ml-3">Total Results: {totalResults}</div>
        <div className="ml-auto">
          <button
            onClick={toggleFilterVisibility}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            <HiFilter className="mr-2 inline-block" />
            Filter
          </button>
        </div>
      </div>
      {isFilterVisible && (
        <div className="my-4 rounded-md border border-gray-300 bg-gray-100 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="productOrderName"
                className="block text-sm font-medium text-gray-700"
              >
                Product Order Name
              </label>
              <input
                type="text"
                name="productOrderNumber"
                id="productOrderName"
                value={filterInputs.productOrderNumber || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="externalPoNumber"
                className="block text-sm font-medium text-gray-700"
              >
                External Product Order
              </label>
              <input
                type="text"
                name="externalPoNumber"
                id="externalPoNumber"
                value={filterInputs.externalPoNumber || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="assignedUserRef"
                className="block text-sm font-medium text-gray-700"
              >
                User
              </label>
              <select
                name="assignedUserRef"
                id="assignedUserRef"
                value={filterInputs.assignedUserRef || ''}
                onChange={handleUserChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <DatePicker
                selected={
                  filterInputs.startDate
                    ? filterInputs.startDate.toDate()
                    : null
                }
                onChange={(date) => handleDateChange('startDate', date)}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                dateFormat="yyyy/MM/dd"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <DatePicker
                selected={
                  filterInputs.endDate ? filterInputs.endDate.toDate() : null
                }
                onChange={(date) => handleDateChange('endDate', date)}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                dateFormat="yyyy/MM/dd"
              />
            </div>
            <div>
              <label
                htmlFor="siteRef"
                className="block text-sm font-medium text-gray-700"
              >
                Site
              </label>
              <select
                name="siteRef"
                id="siteRef"
                value={filterInputs.siteRef || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
              <label
                htmlFor="planningStatus"
                className="block text-sm font-medium text-gray-700"
              >
                Planning Status
              </label>
              <select
                name="planningStatus"
                id="planningStatus"
                value={filterInputs.planningStatus || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select Status</option>
                {Object.values(Statuses).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ntStatus"
                className="block text-sm font-medium text-gray-700"
              >
                NT Status
              </label>
              <select
                name="ntStatus"
                id="ntStatus"
                value={filterInputs.ntStatus || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select Status</option>
                {Object.values(Statuses).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="sacStatus"
                className="block text-sm font-medium text-gray-700"
              >
                SAC Status
              </label>
              <select
                name="sacStatus"
                id="sacStatus"
                value={filterInputs.sacStatus || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select Status</option>
                {Object.values(Statuses).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3 flex justify-end gap-2">
              <button
                onClick={clearFilters}
                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="my-8 w-full border-b-4 border-teal-700"></div>
      <div className="flex-1 overflow-hidden">
        <div
          className="h-[calc(100vh-200px)] overflow-y-auto"
          ref={tableContainerRef}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('productOrderNumber')}
                >
                  Product Order Number
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('externalProductOrderNumber')}
                >
                  External Product Order
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  User
                </th>
                <th
                  scope="col"
                  className=" px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('siteRef')}
                >
                  Site
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('createdDate')}
                >
                  Date Created
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('createdDate')}
                >
                  Invoice Date
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('planningCompletion')}
                >
                  Planning Completion
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('planningStatus')}
                >
                  Planning Status
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('ntCompletion')}
                >
                  NT Completion
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('ntStatus')}
                >
                  NT Status
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('sacCompletion')}
                >
                  SAC Completion
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('sacStatus')}
                >
                  SAC Status
                </th>
              </tr>
            </thead>
            <tbody className="cursor-pointer divide-y divide-gray-200 bg-white">
              {sortedProductOrders.length > 0 ? (
                sortedProductOrders.map((order) => (
                  <tr
                    key={order.productOrderNumber}
                    onClick={() => handleRowClick(order.productOrderNumber)}
                  >
                    <td className=" whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.productOrderNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.externalProductOrderNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {allUsers.find(
                        (user) => user.id === order.assignedUserRef,
                      )
                        ? `${allUsers.find((user) => user.id === order.assignedUserRef)?.firstName} 
                        ${allUsers.find((user) => user.id === order.assignedUserRef)?.lastname}`
                        : ''}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {allSites.find((site) => site.id === order.siteRef)?.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {convertDateToInternationalDateString(order.createdDate)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {convertDateToInternationalDateString(
                        order.invoiceDate || '',
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.planningCompletion}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.planningStatus}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.ntCompletion}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.ntStatus}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.sacCompletion}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {order.sacStatus}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={12}
                    className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No product orders available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 rounded-full bg-teal-700 p-3 text-white shadow-lg hover:bg-teal-600"
          >
            <HiArrowUp className="text-xl" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ManagerDashboard);

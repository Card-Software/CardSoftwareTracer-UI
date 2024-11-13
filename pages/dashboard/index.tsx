import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/app/layout';
import TracerButton from '@/components/tracer-button.component';
import { HiPlus, HiFilter } from 'react-icons/hi';
import ProductOrderItem from '@/components/product-order-item.component';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { ProductOrder } from '@/models/product-order';
import withAuth from '@/hoc/auth';
import LoadingOverlay from '@/components/loading-overlay.component';
import { AllResponse } from '@/models/all-response';
import { PoSearchFilters } from '@/models/po-search-filter';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { Site } from '@/models/site';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import toast, { Toast } from 'react-hot-toast';
import { TeamStatus } from '@/models/team-status';
import { teamStatusProxy } from '@/proxies/team-status.proxy';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [filteredProductOrders, setFilteredProductOrders] = useState<ProductOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allStatuses, setAllStatuses] = useState<TeamStatus[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [filterValues, setFilterValues] = useState<PoSearchFilters>({
    referenceNumber: null,
    productOrderNumber: null,
    externalPoNumber: null,
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
  const hasPageBeenRendered = useRef(false);
  const fetchingPo = useRef(false);

  const [pageSize, setPageSize] = useState<number>(50);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // #region UseEffect

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
      pageSize: parseInt(getStringValue(query.pageSize)) || 50,
      pageNumber: parseInt(getStringValue(query.pageNumber)) || 1,
    };

    // Only set filterValues if the page has not been rendered before
    if (!hasPageBeenRendered.current) {
      setFilterValues(initialFilters);
      fetchProductOrders(initialFilters);
      hasPageBeenRendered.current = true;
    }
  }, [router.isReady, router.query]);

  // Fetch function moved out

  // Update router query params when pagination or filters change
  useEffect(() => {
    if (!router.isReady || !hasPageBeenRendered.current) return;

    const query: { [key: string]: string | number } = {};

    Object.keys(filterValues).forEach((key) => {
      const value = filterValues[key as keyof PoSearchFilters];
      if (value !== null && value !== '') {
        query[key] = typeof value === 'object' && value.toISOString ? value.toISOString() : String(value);
      }
    });

    // Add pageSize and pageNumber to the query if necessary
    if (pageSize) query.pageSize = pageSize;
    if (pageNumber) query.pageNumber = pageNumber;

    router.replace({ pathname: router.pathname, query });
  }, [filterValues, pageSize, pageNumber]);

  // #endregion

  // #region Fetch Product Orders
  const fetchProductOrders = async (filters: PoSearchFilters) => {
    try {
      if (fetchingPo.current) return;
      fetchingPo.current = true;
      setIsLoading(true);
      const response: AllResponse = await orderManagementApiProxy.searchProductOrdersByFilters(
        filters,
        pageNumber,
        pageSize,
      );
      fetchingPo.current = false;
      const sorted = response.results.sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      );
      setProductOrders(sorted);
      setFilteredProductOrders(sorted);
      setTotalResults(response.totalResults);
    } catch (error) {
      console.error('Failed to fetch product orders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // #endregion

  // #region Filter Handlers
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
    // Clear query params
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true },
    );
  };
  // #endregion

  // #region Pagination Handlers
  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
  };
  // #endregion

  const successDeleteMessage = () => toast.success('Product Order deleted successfully!');
  const errorDeleteMessage = () => toast.error('Failed to delete Product Order');

  // #region Delete Product Order
  const handleDeleteProductOrder = async (orderToDelete: ProductOrder) => {
    if (!orderToDelete.id) {
      return;
    }
    // if (confirmDelete) {
    try {
      setIsLoading(true);
      await orderManagementApiProxy.deleteProductOrder(orderToDelete.id);
      setProductOrders(productOrders.filter((order) => order.id !== orderToDelete.id));
      setFilteredProductOrders(filteredProductOrders.filter((order) => order.id !== orderToDelete.id));
      successDeleteMessage();
    } catch (error) {
      console.error('Failed to delete Product Order', error);
      errorDeleteMessage();
    } finally {
      setIsLoading(false);
    }
    // }
  };

  // #endregion

  const getStatusByName = (name: string) => {
    return allStatuses.find((status) => status.name === name);
  };

  return (
    <Layout>
      <LoadingOverlay show={fetchingPo.current} />
      <div className="content">
        <div aria-label="Toolbar">
          <div className="tool-bar-content">
            <h1>Dashboard</h1>
            <div className="row">
              <TracerButton
                name="Add New PO"
                icon={<HiPlus />}
                onClick={() => router.push('/dashboard/new-product-order')}
              />
              <button
                onClick={toggleFilterVisibility}
                className="flex items-center rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                <HiFilter className="mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>
        {isFilterVisible && (
          <div className="my-6 flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
            <div className="grid flex-grow grid-cols-3 gap-4">
              <div>
                <label htmlFor="productOrderName" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="productOrderName" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="externalPoNumber" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="assignedUserRef" className="block text-sm font-semibold text-gray-800">
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

              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="planningStatus" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="ntStatus" className="block text-sm font-semibold text-gray-800">
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
                <label htmlFor="sacStatus" className="block text-sm font-semibold text-gray-800">
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
              <div>
                <label htmlFor="siteRef" className="block text-sm font-semibold text-gray-800">
                  Site
                </label>
                <select
                  name="siteRef"
                  id="siteRef"
                  value={filterValues.siteRef || ''}
                  onChange={handleFilterChange}
                  className="mt-2 w-full p-1"
                >
                  <option value="">Select a site</option>
                  {allSites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex w-full justify-end gap-2">
              <button
                onClick={clearFilters}
                style={{ borderRadius: '10px 10px 10px 10px' }}
                className="rounded-md border-2 border-blue-500 bg-white px-5 py-2 font-semibold text-blue-500 shadow-none hover:bg-blue-100"
              >
                Clear All
              </button>
              <TracerButton type="submit" name="Apply Filter" onClick={() => fetchProductOrders(filterValues)} />
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-3 gap-4 mb-[6rem]">
          {filteredProductOrders.length > 0 ? (
            filteredProductOrders.map((order) => (
              <ProductOrderItem
                key={order.id}
                productOrder={order}
                handleDeleteProductOrder={handleDeleteProductOrder}
              />
            ))
          ) : (
            <p>No product orders available.</p>
          )}
        </div>
      </div>

      <footer>
        <span className="text-white">Total Results: {totalResults}</span>

        <div className="ml-auto">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="mx-4 text-white">
            Page {pageNumber} of {Math.ceil(totalResults / pageSize)}
          </span>

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber * pageSize >= totalResults}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </footer>
    </Layout>
  );
};

export default withAuth(Dashboard);

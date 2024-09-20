import React, { useEffect, useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/dashboard.css';
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
import { Statuses } from '@/models/enum/statuses';
import { Site } from '@/models/site';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import toast, { Toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [filteredProductOrders, setFilteredProductOrders] = useState<
    ProductOrder[]
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

  const [pageSize, setPageSize] = useState<number>(50);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  let loadingOrders = false;

  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    if (organization) {
      setAllSites(organization.sites || []);
      setAllUsers(organization.users || []);
    }

    if (!loadingOrders) {
      fetchProductOrders();
      loadingOrders = true;
    }
  }, []);

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
  }, [router.query]);

  useEffect(() => {
    if (initialLoad) return;
    fetchProductOrders();
  }, [filterValues, pageNumber, pageSize]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const fetchProductOrders = async () => {
    try {
      setIsLoading(true);
      const response: AllResponse =
        await orderManagementApiProxy.searchProductOrdersByFilters(
          filterValues,
          pageNumber,
          pageSize,
        );
      setInitialLoad(false);
      const sorted = response.results.sort((a, b) => {
        if (a.createdDate && b.createdDate) {
          return (
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
          );
        }
        return 0;
      });
      setProductOrders(sorted);
      setFilteredProductOrders(sorted);
      setTotalResults(response.totalResults);
    } catch (error) {
      console.error('Failed to fetch product orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilterInputs({
      ...filterInputs,
      [e.target.name]: e.target.value,
    });
  };

  const clearAllFilters = () => {
    setFilterInputs({
      productOrderNumber: '',
      externalPoNumber: '',
      assignedUserRef: '',
      startDate: null,
      endDate: null,
      siteRef: '',
      planningStatus: '',
      ntStatus: '',
      sacStatus: '',
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

  const successDeleteMessage = () => toast.success('Product Order deleted successfully!');
  const errorDeleteMessage = () => toast.error('Failed to delete Product Order');

  const handleDeleteProductOrder = async (orderToDelete: ProductOrder) => {
    if (!orderToDelete.id) {
      return;
    }
    // if (confirmDelete) {
    try {
      setIsLoading(true);
      await orderManagementApiProxy.deleteProductOrder(orderToDelete.id);
      setProductOrders(
        productOrders.filter((order) => order.id !== orderToDelete.id),
      );
      setFilteredProductOrders(
        filteredProductOrders.filter((order) => order.id !== orderToDelete.id),
      );
      successDeleteMessage();
    } catch (error) {
      console.error('Failed to delete Product Order', error);
      errorDeleteMessage();
    } finally {
      setIsLoading(false);
    }
    // }
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1>Dashboard</h1>
        </div>
        <div className="tool-bar-buttons">
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
      {isFilterVisible && (
        <div className="my-6 rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="productOrderName"
                className="block text-sm font-semibold text-gray-800"
              >
                Product Order Name
              </label>
              <input
                type="text"
                name="productOrderNumber"
                id="productOrderName"
                value={filterInputs.productOrderNumber || ''}
                onChange={handleFilterChange}
                className="input-custom"
              />
            </div>
            <div>
              <label
                htmlFor="externalPoNumber"
                className="block text-sm font-semibold text-gray-800"
              >
                External Product Order
              </label>
              <input
                type="text"
                name="externalPoNumber"
                id="externalPoNumber"
                value={filterInputs.externalPoNumber || ''}
                onChange={handleFilterChange}
                className="input-custom"
              />
            </div>
            <div>
              <label
                htmlFor="assignedUserRef"
                className="block text-sm font-semibold text-gray-800"
              >
                User
              </label>
              <select
                name="assignedUserRef"
                id="assignedUserRef"
                value={filterInputs.assignedUserRef || ''}
                onChange={handleUserChange}
                className="input-custom"
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
                className="block text-sm font-semibold text-gray-800"
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
                className="input-custom"
                dateFormat="yyyy/MM/dd"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-semibold text-gray-800"
              >
                End Date
              </label>
              <DatePicker
                selected={
                  filterInputs.endDate ? filterInputs.endDate.toDate() : null
                }
                onChange={(date) => handleDateChange('endDate', date)}
                className="input-custom"
                dateFormat="yyyy/MM/dd"
              />
            </div>
            <div>
              <label
                htmlFor="siteRef"
                className="block text-sm font-semibold text-gray-800"
              >
                Site
              </label>
              <select
                name="siteRef"
                id="siteRef"
                value={filterInputs.siteRef || ''}
                onChange={handleFilterChange}
                className="input-custom"
              >
                <option value="">Select a site</option>
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
                className="block text-sm font-semibold text-gray-800"
              >
                Planning Status
              </label>
              <select
                name="planningStatus"
                id="planningStatus"
                value={filterInputs.planningStatus || ''}
                onChange={handleFilterChange}
                className="input-custom"
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
                className="block text-sm font-semibold text-gray-800"
              >
                NT Status
              </label>
              <select
                name="ntStatus"
                id="ntStatus"
                value={filterInputs.ntStatus || ''}
                onChange={handleFilterChange}
                className="input-custom"
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
                className="block text-sm font-semibold text-gray-800"
              >
                SAC Status
              </label>
              <select
                name="sacStatus"
                id="sacStatus"
                value={filterInputs.sacStatus || ''}
                onChange={handleFilterChange}
                className="input-custom"
              >
                <option value="">Select Status</option>
                {Object.values(Statuses).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={clearAllFilters}
              className="rounded-md border border-blue-500 bg-white px-5 py-2 font-semibold text-blue-500 transition-colors duration-200 hover:bg-blue-500 hover:text-white"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="rounded-md bg-[var(--primary-button)] px-5 py-2 font-semibold text-white transition-colors duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div
        className="my-4 mt-3 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div className="grid grid-cols-3 gap-4">
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

      {/* <footer
        className="stream-footer fixed bottom-0 flex w-full items-center justify-between p-4"
        style={{
          backgroundColor: 'var(--primary-color)',
          maxWidth: 'calc(100% - 175px)',
        }}
      >
        <span className="text-white">Total Results: {totalResults}</span>

        <div className="flex items-center">
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
      </footer> */}
    </Layout>
  );
};

export default withAuth(Dashboard);

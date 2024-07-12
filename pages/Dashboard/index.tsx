import React, { useEffect, useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/dashboard.css';
import TracerButton from '@/components/TracerButton';
import { HiPlus, HiFilter } from 'react-icons/hi';
import ProductOrderItem from '@/components/ProductOrderItem';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import withAuth from '@/hoc/auth';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AllResponse } from '@/models/AllResponse';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [filteredProductOrders, setFilteredProductOrders] = useState<
    ProductOrder[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [filterValues, setFilterValues] = useState({
    productOrderName: '',
    externalPoNumber: '',
    dateRange: '',
    site: '',
    planningStatus: '',
    ntStatus: '',
    sacStatus: '',
  });

  const [pageSize, setPageSize] = useState<number>(50);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const handleNewProductOrder = () => {
    router.push('/Dashboard/NewProductOrder');
  };

  useEffect(() => {
    const fetchProductOrders = async () => {
      try {
        setIsLoading(true);
        const response: AllResponse =
          await orderManagementApiProxy.getAllProductOrders(
            pageNumber,
            pageSize,
          );
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
  }, [pageNumber, pageSize]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilterValues({
      ...filterValues,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    const filteredOrders = productOrders.filter((order) => {
      const productOrderMatch = order.productOrderNumber
        .toLowerCase()
        .includes(filterValues.productOrderName.toLowerCase());
      const externalOrderMatch = (order?.externalProductOrderNumber ?? '')
        .toLowerCase()
        .includes(filterValues.externalPoNumber.toLowerCase());

      return productOrderMatch && externalOrderMatch;
    });

    setFilteredProductOrders(filteredOrders);
  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="flex flex-row items-center">
        <div className="me-8 text-xl">
          <h1>File Upload</h1>
        </div>
        <div>
          <TracerButton
            name="Add New PO"
            icon={<HiPlus />}
            onClick={handleNewProductOrder}
          />
        </div>
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
                name="productOrderName"
                id="productOrderName"
                value={filterValues.productOrderName}
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
                value={filterValues.externalPoNumber}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            {/* Other filter fields here */}
            <div className="col-span-3 flex justify-end">
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
      <div className="grid grid-cols-3 gap-4">
        {filteredProductOrders.length > 0 ? (
          filteredProductOrders.map((order) => (
            <div key={order.productOrderNumber}>
              <ProductOrderItem productOrder={order} />
            </div>
          ))
        ) : (
          <p>No product orders available.</p>
        )}
      </div>
      <footer className="footer-class sticky bottom-0 mb-2 flex items-center justify-between bg-gray-800 p-4">
        <span className="text-white">Total Results: {totalResults}</span>
        <div>
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-4 text-white">Page {pageNumber}</span>
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

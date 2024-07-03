import React, { useEffect, useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/dashboard.css';
import TracerButton from '@/components/TracerButton';
import { HiPlus } from 'react-icons/hi';
import ProductOrderItem from '@/components/ProductOrderItem';
import { useRouter } from 'next/router';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import withAuth from '@/hoc/auth';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);

  const handleNewProductOrder = () => {
    router.push('/Dashboard/NewProductOrder');
  };

  useEffect(() => {
    const fetchProductOrders = async () => {
      try {
        const orders = await orderManagementApiProxy.getAllProductOrders();
        setProductOrders(orders);
      } catch (error) {
        console.error('Failed to fetch product orders:', error);
      }
    };

    fetchProductOrders();
  }, []);

  return (
    <Layout>
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
      </div>
      <div className="my-8 w-full border-b-4 border-teal-700"></div>
      {/* Grid container for product orders */}
      <div className="grid grid-cols-3 gap-4">
        {productOrders.length > 0 ? (
          productOrders.map((order) => (
            <div key={order.productOrderNumber}>
              <ProductOrderItem productOrder={order} />
            </div>
          ))
        ) : (
          <p>No product orders available.</p>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);

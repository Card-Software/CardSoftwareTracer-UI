import React, { useEffect, useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/dashboard.css';
import TracerButton from '@/components/TracerButton';
import { HiPlus } from 'react-icons/hi';
import ProductOrderItem from '@/components/ProductOrderItem';
import Modal from '@/components/CardSoftwareModal';
import { useRouter } from 'next/router';
import WholeSaleItem from '@/components/WholeSaleItem';
import demoDocs from '../../sample-docs/demo-docs.json';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [productOrders, setProductOrders] = useState<any[]>([]);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleNewProductOrder = () => {
    router.push('/Dashboard/NewProductOrder');
  };

  const handleNewWholeSaleOrder = () => {
    router.push('/Dashboard/NewWholeSaleOrder');
  };

  useEffect(() => {
    // Extract and set product orders from demoDocs
    const orders = demoDocs.map((doc) => {
      return {
        poNumber: doc.ProductOrder,
        progress: 0, // Assuming default progress, update if you have specific logic
        assignedTo: doc.AssignedTo,
        dueDate: '2024-06-18', // Update this field if you have actual due dates
        href: `/Dashboard/po/${doc.ProductOrder}`,
        ...doc,
      };
    });
    setProductOrders(orders);
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
        <div className="ps-6">
          <TracerButton
            name="Add Wholesale Order"
            icon={<HiPlus />}
            onClick={handleNewWholeSaleOrder}
          />
        </div>
      </div>
      <div className="w-100 my-8 bg-gray-500">Filter</div>
      <div>
        {productOrders.map((order, index) => (
          <div key={index}>
            <ProductOrderItem
              poNumber={order.poNumber}
              progress={order.progress}
              assignedTo={order.assignedTo}
              dueDate={order.dueDate}
              href={order.href}
            />
            {/* <WholeSaleItem
              woNumber={order.poNumber.replace('PO', 'WO')}
              progress={order.progress}
              assignedTo={order.assignedTo}
              dueDate={order.dueDate}
              href={`/Dashboard/wo/${order.poNumber.replace('PO', 'WO')}`}
            /> */}
          </div>
        ))}
      </div>

      <Modal show={showModal} onClose={closeModal} title="Select an Option">
        <select>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
        <select>
          <option value="optionA">Option A</option>
          <option value="optionB">Option B</option>
          <option value="optionC">Option C</option>
        </select>
      </Modal>
    </Layout>
  );
};

export default Dashboard;

// components/DashboardPage.tsx
import React, { useState } from 'react';
import Layout from '@/app/layout';
import '../../styles/dashboard.css';
import TracerButton from '@/components/TracerButton';
import { HiPlus } from 'react-icons/hi';
import ProductOrderItem from '@/components/ProductOrderItem';
import Modal from '@/components/CardSoftwareModal';
import { useRouter } from 'next/router';
import WholeSaleItem from '@/components/WholeSaleItem';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const poNumber = '123-456-789';
  const woNumber = '123-333-777';

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleNewProductOrder = () => {
    router.push('/Dashboard/NewProductOrder');
  };

  const handleNewWholeSaleOrder = () => {
    router.push('/Dashboard/NewWholeSaleOrder');
  };

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
        <ProductOrderItem
          poNumber={poNumber}
          progress={3}
          assignedTo={'Collin Shields'}
          dueDate={'05/13/2024'}
        />
        <WholeSaleItem
          woNumber={woNumber}
          progress={2}
          assignedTo={'Collin Shields'}
          dueDate={'05/13/2024'}
          href={`/Dashboard/wo/${woNumber}`}
        />
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

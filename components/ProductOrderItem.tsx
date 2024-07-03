import React from 'react';
import { HiUser } from 'react-icons/hi';
import ProgressBar from './ProgressBar';
import Link from 'next/link';
import { ProductOrder } from '@/models/ProductOrder';

interface ProductOrderProps {
  productOrder: ProductOrder;
}

const ProductOrderItem: React.FC<ProductOrderProps> = ({ productOrder }) => {
  const poNumber = productOrder.productOrderNumber;
  const assignedTo = productOrder.assignedUser
    ? `${productOrder.assignedUser.firstName} ${productOrder.assignedUser.lastname}`
    : 'Unassigned';
  const dueDate = new Date(productOrder.createdDate).toLocaleDateString();

  return (
    <Link href={`Dashboard/po/${poNumber}`}>
      <div className="mb-8 max-w-72 rounded border border-black p-4">
        <h2>PO {poNumber}</h2>
        <ProgressBar productOrder={productOrder} />
        <div className="mt-2 flex items-center">
          Assigned to: <HiUser className="ml-2" />
          <span>{assignedTo}</span>
        </div>
        <div className="mt-2">Due Date: {dueDate}</div>
      </div>
    </Link>
  );
};

export default ProductOrderItem;

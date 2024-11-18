import React, { useState } from 'react';
import { HiUser } from 'react-icons/hi';
import { FaTrash } from 'react-icons/fa';
import ProgressBar from './progress-bar.component';
import Link from 'next/link';
import { ProductOrder } from '@/models/product-order';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import { format } from 'date-fns';
import AlertModal from './modals/alert-modal-component';
import { useRouter } from 'next/router';

interface ProductOrderItemProps {
  productOrder: ProductOrder;
  handleDeleteProductOrder: (productOrder: ProductOrder) => void;
}

const ProductOrderItem: React.FC<ProductOrderItemProps> = ({
  productOrder,
  handleDeleteProductOrder,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState<number | null>(
    null,
  );
  const router = useRouter();

  const poNumber = productOrder.productOrderNumber;
  const poNumberUri = encodeURIComponent(poNumber);
  const assignedTo = productOrder.assignedUser
    ? `${productOrder.assignedUser.firstName} ${productOrder.assignedUser.lastname}`
    : 'Unassigned';
  const dateCreated = productOrder.invoiceDate;
  const user: User = userAuthenticationService.getUser() as User;
  const isAdmin = user.role.includes('Admin');

  const formattedDate = dateCreated
    ? format(new Date(dateCreated), 'dd/MM/yyyy')
    : 'N/A';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteProductOrder(productOrder);
    setIsModalOpen(false);
  };

  return (
    <>
      <Link href={`/dashboard/po/${productOrder.id as string}`}>
        <div
          className="flex flex-col justify-between rounded-md border border-gray-400 p-4"
          style={{ height: '260px', width: '300px' }}
        >
          <div className="mb-1 flex flex-row items-center justify-between">
            <h2 className="font-semibold text-black">Product Order</h2>

            {isAdmin && (
              <button className="square" onClick={handleDeleteClick}>
                <FaTrash className='trashButton'/>
              </button>
            )}
          </div>
          <div className="mb-1">
            <p className="text-sm text-gray-500">{poNumber}</p>
          </div>
          <div className="mb-1">
            <p className="mt-1 text-sm font-semibold text-black">
              Reference Number
            </p>
            <p className="text-sm text-gray-500">
              {productOrder.referenceNumber || 'N/A'}
            </p>
          </div>
          <div className="mb-1">
            <p className="mt-1 text-sm font-semibold text-black">
              Invoice Date
            </p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          <div className="flex-grow"></div>

          <div>
            <ProgressBar
              productOrder={productOrder}
              onProgressChange={setProgressPercentage}
            />
            <div className="mt-2 flex flex-row items-center justify-between">
              <div className="progress-info rounded-2xl bg-gray-100 p-1 pe-4 ps-4 text-sm text-blue-500">
                {progressPercentage !== null
                  ? `${progressPercentage.toFixed(0)}%`
                  : 'N/A'}{' '}
                complete
              </div>
              <div className="assigned flex flex-row items-center">
                <HiUser className="text-gray-400" />
                <span
                  className="ml-1 text-sm font-semibold"
                  style={{ color: '#BABABA' }}
                >
                  {assignedTo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {isModalOpen && (
        <AlertModal
          isOpen={isModalOpen}
          type="delete"
          title="Confirm Delete"
          message="Are you sure you want to delete this product order?"
          icon={<FaTrash className="text-red-500" />}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default ProductOrderItem;

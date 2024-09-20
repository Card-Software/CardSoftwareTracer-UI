import React, { useState } from 'react';
import { HiUser } from 'react-icons/hi';
import { FaTrash } from 'react-icons/fa';
import ProgressBar from './progress-bar.component';
import Link from 'next/link';
import { ProductOrder } from '@/models/product-order';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

interface ProductOrderItemProps {
  productOrder: ProductOrder;
  handleDeleteProductOrder: (productOrder: ProductOrder) => void;
}

const ProductOrderItem: React.FC<ProductOrderItemProps> = ({
  productOrder,
  handleDeleteProductOrder,
}) => {
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

  const handleOrderClick = () => {
    router.push(`/dashboard/po/${productOrder.id as string}`);
  };

  return (
    <div>
      <div
        onClick={handleOrderClick}
        className="flex flex-col justify-between rounded-md border border-gray-400 p-4"
        style={{ height: '210px', width: '300px', cursor: 'pointer' }}
      >
        <div className="mb-1 flex flex-row items-center justify-between">
          <h2 className="font-semibold text-black">Product Order</h2>

          {isAdmin && (
            <button
              className="square"
              onClick={(e) => {
                e.preventDefault(); // Prevents navigation
                e.stopPropagation(); // Prevents parent click event from firing
                handleDeleteProductOrder(productOrder); // Call delete function
              }}
            >
              <FaTrash />
            </button>
          )}
        </div>
        <div className="mb-1">
          <p className="text-sm text-gray-500">{poNumber}</p>
        </div>
        <div className="mb-1">
          <p className="mt-1 text-sm font-semibold text-black">Invoice Date</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>

        {/* This flex-grow ensures that the space above takes up any extra space */}
        <div className="flex-grow"></div>

        {/* Progress bar and info pinned to the bottom */}
        <div>
          <ProgressBar
            productOrder={productOrder}
            onProgressChange={setProgressPercentage}
          />
          <div className="mt-2 flex flex-row items-center justify-between">
            <div className="progress-info rounded-2xl bg-gray-100 p-1  pe-4 ps-4 text-sm text-blue-500">
              {progressPercentage !== null
                ? `${progressPercentage.toFixed(0)}%`
                : 'N/A'}{' '}
              complete
            </div>
            <div className="assigned flex flex-row items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.33319 1.64317C5.93657 0.571828 7.82164 0 9.75 0C12.3351 0.00264726 14.8135 1.03073 16.6414 2.85863C18.4693 4.68654 19.4974 7.16495 19.5 9.75C19.5 11.6784 18.9282 13.5634 17.8568 15.1668C16.7855 16.7702 15.2627 18.0199 13.4812 18.7578C11.6996 19.4958 9.73919 19.6889 7.84787 19.3127C5.95656 18.9365 4.21928 18.0079 2.85571 16.6443C1.49215 15.2807 0.563554 13.5434 0.187348 11.6521C-0.188858 9.76082 0.00422449 7.80042 0.742179 6.01884C1.48013 4.23726 2.72982 2.71452 4.33319 1.64317ZM13.1056 13.207C14.1472 13.729 15.0526 14.4867 15.75 15.42C16.856 14.2481 17.5945 12.778 17.8745 11.1911C18.1545 9.60426 17.9636 7.97015 17.3255 6.49052C16.6874 5.01089 15.63 3.75053 14.2837 2.86502C12.9375 1.97951 11.3614 1.50762 9.75 1.50762C8.13864 1.50762 6.56255 1.97951 5.2163 2.86502C3.87006 3.75053 2.8126 5.01089 2.17448 6.49052C1.53636 7.97015 1.34551 9.60426 1.6255 11.1911C1.90548 12.778 2.64405 14.2481 3.75 15.42C4.44737 14.4867 5.35283 13.729 6.39441 13.207C7.43599 12.6851 8.58496 12.4133 9.75 12.4133C10.915 12.4133 12.064 12.6851 13.1056 13.207ZM8.18879 4.41353C8.65089 4.10476 9.19418 3.93996 9.74994 3.93996C10.1193 3.93864 10.4853 4.01771 10.8255 4.17237C11.1656 4.32703 11.4711 4.55386 11.7223 4.83798C11.9735 5.1221 12.1645 5.45662 12.2837 5.818C12.403 6.17937 12.4482 6.559 12.416 6.93532C12.3839 7.31165 12.275 7.67514 12.0977 8.00209C11.9204 8.32904 11.6794 8.61068 11.3921 8.82625C11.1049 9.04182 10.7782 9.18563 10.4337 9.24662C10.0892 9.30761 9.73587 9.28437 9.39994 9.17996C8.73355 8.96931 8.15825 8.52712 7.77633 7.93266C7.39441 7.3382 7.23083 6.62618 7.31525 5.92854C7.39966 5.2309 7.72507 4.58882 8.23479 4.11735L8.18879 4.41353Z"
                  fill="#BABABA"
                />
              </svg>
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
    </div>
  );
};

export default ProductOrderItem;

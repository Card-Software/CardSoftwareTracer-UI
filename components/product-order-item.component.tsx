import React from 'react';
import { HiUser } from 'react-icons/hi';
import { FaTrash } from 'react-icons/fa';
import ProgressBar from './progress-bar.component';
import Link from 'next/link';
import { ProductOrder } from '@/models/product-order';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { User } from '@/models/user';
import { format } from 'date-fns';

interface ProductOrderItemProps {
  productOrder: ProductOrder;
  handleDeleteProductOrder: (productOrder: ProductOrder) => void;
}

const ProductOrderItem: React.FC<ProductOrderItemProps> = ({
  productOrder,
  handleDeleteProductOrder,
}) => {
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

  return (
    <Link href={`/dashboard/po/${poNumberUri}`}>
      <div
        className="flex flex-col rounded-md border border-gray-400 p-4"
        style={{ height: '210px', width: '300px' }}
      >
        <div className="mb-2 flex flex-row items-center justify-between">
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
        <div className="mb-2">
          <p className="text-sm text-gray-500">{poNumber}</p>
        </div>
        <div className="mb-2">
          <p className="mt-2 text-sm font-semibold text-black">Invoice Date</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>

        {/* Flex-grow makes sure the ProgressBar and bottom content stay at the bottom */}
        <div className="flex-grow">
          <ProgressBar productOrder={productOrder} />
        </div>

        <div className="flex flex-row items-center justify-between">
          <div className="progress-info">% complete</div>
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
                d="M4.33319 1.64317C5.93657 0.571828 7.82164 0 9.75 0C12.3351 0.00264726 14.8135 1.03073 16.6414 2.85863C18.4693 4.68654 19.4974 7.16495 19.5 9.75C19.5 11.6784 18.9282 13.5634 17.8568 15.1668C16.7855 16.7702 15.2627 18.0199 13.4812 18.7578C11.6996 19.4958 9.73919 19.6889 7.84787 19.3127C5.95656 18.9365 4.21928 18.0079 2.85571 16.6443C1.49215 15.2807 0.563554 13.5434 0.187348 11.6521C-0.188858 9.76082 0.00422449 7.80042 0.742179 6.01884C1.48013 4.23726 2.72982 2.71452 4.33319 1.64317ZM13.1056 13.207C14.1472 13.729 15.0526 14.4867 15.75 15.42C16.856 14.2481 17.5945 12.778 17.8745 11.1911C18.1545 9.60426 17.9636 7.97015 17.3255 6.49052C16.6874 5.01089 15.63 3.75053 14.2837 2.86502C12.9375 1.97951 11.3614 1.50762 9.75 1.50762C8.13864 1.50762 6.56255 1.97951 5.2163 2.86502C3.87006 3.75053 2.8126 5.01089 2.17448 6.49052C1.53636 7.97015 1.34551 9.60426 1.6255 11.1911C1.90548 12.778 2.64405 14.2481 3.75 15.42C4.44737 14.4867 5.35283 13.729 6.39441 13.207C7.43599 12.6851 8.58496 12.4133 9.75 12.4133C10.915 12.4133 12.064 12.6851 13.1056 13.207ZM8.18879 4.41353C8.65089 4.10476 9.19418 3.93996 9.74994 3.93996C10.1193 3.93864 10.4853 4.01042 10.8268 4.15117C11.1684 4.29191 11.4787 4.49885 11.7399 4.76004C12.0011 5.02124 12.208 5.33154 12.3487 5.67306C12.4895 6.01458 12.5613 6.38057 12.5599 6.74996C12.5599 7.30572 12.3951 7.84901 12.0864 8.31111C11.7776 8.77321 11.3387 9.13338 10.8253 9.34606C10.3118 9.55874 9.74683 9.61439 9.20174 9.50597C8.65665 9.39754 8.15596 9.12992 7.76297 8.73693C7.36999 8.34394 7.10236 7.84325 6.99394 7.29816C6.88551 6.75308 6.94116 6.18808 7.15384 5.67462C7.36652 5.16116 7.72669 4.7223 8.18879 4.41353Z"
                fill="#8D8D8D"
              />
            </svg>
            <span>{assignedTo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductOrderItem;

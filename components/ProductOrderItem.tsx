import React from 'react';
import { HiUser } from 'react-icons/hi';
import { FaTrash } from 'react-icons/fa';
import ProgressBar from './ProgressBar';
import Link from 'next/link';
import { ProductOrder } from '@/models/ProductOrder';
import styled from 'styled-components';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import { User } from '@/models/User';

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
  const dateCreated = new Date(productOrder.createdDate).toLocaleDateString();
  const user: User = userAuthenticationService.getUser() as User;
  const isAdmin = user.role.includes('Admin');

  return (
    <Link href={`/Dashboard/po/${poNumberUri}`}>
      <Container>
        <Header>
          <h2>PO {poNumber}</h2>
          {isAdmin && (
            <DeleteButton
              onClick={(e) => {
                e.preventDefault(); // Prevents navigation
                e.stopPropagation(); // Prevents parent click event from firing
                handleDeleteProductOrder(productOrder); // Call delete function
              }}
            >
              <FaTrash />
            </DeleteButton>
          )}
        </Header>
        <ProgressBar productOrder={productOrder} />
        <Info>
          <div className="assigned">
            Assigned to: <HiUser className="icon" />
            <span>{assignedTo}</span>
          </div>
          <div>Date Created: {dateCreated}</div>
        </Info>
      </Container>
    </Link>
  );
};

export default ProductOrderItem;

const Container = styled.div`
  margin-bottom: 2rem;
  max-width: 18rem;
  border: 1px solid black;
  padding: 1rem;
  border-radius: 8px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 1rem;
  color: #f56565;
`;

const Info = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;

  .assigned {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;

    .icon {
      margin-left: 0.5rem;
    }
  }
`;

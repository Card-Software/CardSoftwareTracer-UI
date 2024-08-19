import React, { use, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as Yup from 'yup';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { User } from '@/models/user';
import { ProductOrder } from '@/models/product-order';
import { is } from 'date-fns/locale';
import { init } from 'next/dist/compiled/webpack/webpack';
import type { Organization } from '@/models/organization';
import { userAuthenticationService } from '@/services/user-authentication.service';
import styled from 'styled-components';
const isUserValid = (value: any): value is User => {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.organizationRef === 'string' &&
    Array.isArray(value.role)
  );
};

const productOrderDetailsSchema = Yup.object().shape({
  productOrderNumber: Yup.string()
    .required('Product Order Number is required')
    .matches(
      /^[A-Za-z0-9\s-]+$/,
      'Only letters, numbers, spaces, and dashes are allowed',
    ),
  referenceNumber: Yup.string(),
  lot: Yup.string(),
  externProductOrderNumber: Yup.string().matches(
    /^[A-Za-z0-9\s-]+$/,
    'Only letters, numbers, spaces, and dashes are allowed',
  ),
  siteRef: Yup.string(),
  provider: Yup.string(),
  client: Yup.string(),
  assignedUser: Yup.mixed<User>()
    .required('Assigned User is required')
    .test('is-valid-user', 'Assigned User is not valid', (value) =>
      isUserValid(value),
    ),
  dateCreated: Yup.date().required('Date Created is required'),
  invoiceDate: Yup.date(),
  quantity: Yup.number(),
  product: Yup.string(),
  description: Yup.string(),
});

const productOrderFromGroupSchema = Yup.object().shape({
  isValid: Yup.boolean().required(),
  productOrderDetails: productOrderDetailsSchema,
});

interface ProductOrderDetailsProps {
  initialProductOrderDetails: ProductOrder | null;
  onChange: (productOrderDetails: any) => void;
}

const ProductOrderDetails1: React.FC<ProductOrderDetailsProps> = ({
  initialProductOrderDetails,
  onChange,
}) => {
  const [Organization, setOrganization] = useState<Organization | null>(null);
  const hasPageBeenRendered = useRef({ organizationLoaded: false });

  //#Region Use Effects
  useEffect(() => {
    if (hasPageBeenRendered.current.organizationLoaded) {
      return;
    }
    hasPageBeenRendered.current.organizationLoaded = true;
    setOrganization(userAuthenticationService.getOrganization());
  }, []);

  //#EndRegion Use Effects

  const populateProductOrderDetails = (): ProductOrder => {
    if (initialProductOrderDetails) {
      return initialProductOrderDetails;
    }
    return {
      productOrderNumber: '',
      ownerRef: '',
      description: '',
      notes: [],
      assignedUser: undefined,
      createdDate: new Date(),
      client: '',
      statuses: [],
      externalProductOrderNumber: '',
      product: '',
      quantity: 0,
      childrenTracerStreams: [],
      childrenPosReferences: [],
      siteRef: '',
      lot: '',
      referenceNumber: '',
      invoiceDate: new Date(),
      provider: '',
      siblingProductOrders: [],
    };
  };
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    defaultValues: {
      isValid: false,
      productOrderDetails: populateProductOrderDetails(),
    },
    resolver: yupResolver(productOrderFromGroupSchema),
    mode: 'onChange',
  });

  const formValues = watch(); // Watch the entire form

  useEffect(() => {
    //este si funciona
    console.log('Form values changed', formValues);
  }, [formValues]);
  return (
    <div>
      {' '}
      <form>
        <div className="form-group">
          <label>Product Order Number</label>
          <Controller
            name={'productOrderDetails.productOrderNumber'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
          <span className="error">
            {errors.productOrderDetails?.productOrderNumber?.message}
          </span>
        </div>
      </form>
    </div>
  );
};

export default ProductOrderDetails1;

const StyledInput = styled.input`
  margin-top: 0.25rem;
  padding: 0.5rem;
  border: 1px solid #cbd5e0; /* Tailwind border-gray-300 */
  border-radius: 0.375rem; /* Tailwind rounded */
  &:focus {
    outline: none;
    border-color: #63b3ed; /* Tailwind focus:border-blue-400 */
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5); /* Tailwind focus:ring */
  }
`;

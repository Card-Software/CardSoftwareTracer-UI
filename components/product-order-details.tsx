import React, { use, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as Yup from 'yup';
import { useForm, useFieldArray, Controller, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { User } from '@/models/user';
import { ProductOrder } from '@/models/product-order';
import { is } from 'date-fns/locale';
import { init } from 'next/dist/compiled/webpack/webpack';
import type { Organization } from '@/models/organization';
import { userAuthenticationService } from '@/services/user-authentication.service';
import styled from 'styled-components';
import { Site } from '@/models/site';
const isUserValid = (value: any): value is User => {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastname === 'string' &&
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
      'Only letters, numbers, spaces,\n and dashes are allowed',
    ),
  referenceNumber: Yup.string(),
  lot: Yup.string(),
  externProductOrderNumber: Yup.string().matches(
    /^[A-Za-z0-9\s-]+$/,
    'Only letters, numbers, spaces,\n and dashes are allowed',
  ),
  siteRef: Yup.string(),
  provider: Yup.string(),
  client: Yup.string().required('Client is required'),
  assignedUser: Yup.mixed<User>()
    .nullable()
    .test('is-valid-user', 'Assigned User is not valid', (value) => {
      if (value === null) {
        return true; // If null, it's valid because it's nullable
      }
      return isUserValid(value); // Otherwise, validate the user
    }),
  dateCreated: Yup.date().required('Date Created is required'),
  invoiceDate: Yup.date().nullable(),
  quantity: Yup.number(),
  product: Yup.string().required('Product is required'),
  description: Yup.string().required('Description is required'),
});

const productOrderFromGroupSchema = Yup.object().shape({
  productOrderDetails: productOrderDetailsSchema,
});

interface ProductOrderDetailsProps {
  initialProductOrderDetails: ProductOrder | null;
  onChange: (productOrderDetailsFormControl: any) => void;
}

const ProductOrderDetails1: React.FC<ProductOrderDetailsProps> = ({
  initialProductOrderDetails,
  onChange,
}) => {
  // #region Initial Values helper function
  const populateProductOrderDetails = (): ProductOrder => {
    if (initialProductOrderDetails) {
      return initialProductOrderDetails;
    }
    return {
      productOrderNumber: '',
      ownerRef: '',
      description: '',
      notes: [],
      assignedUser: null,
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
      invoiceDate: null,
      provider: '',
      siblingProductOrders: [],
    };
  };
  // #endregion

  const {
    control,
    formState: { errors, isValid },
    watch,
  } = useForm({
    defaultValues: {
      productOrderDetails: populateProductOrderDetails(),
    },
    resolver: yupResolver(productOrderFromGroupSchema),
    mode: 'onChange',
  });

  // #region States
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  // #endregion

  // #region Use Refs and watchers
  const hasPageBeenRendered = useRef({ organizationLoaded: false });
  const formValues = watch();

  // #endregion

  // #region All Use Effects
  useEffect(() => {
    if (hasPageBeenRendered.current.organizationLoaded) {
      return;
    }
    hasPageBeenRendered.current.organizationLoaded = true;
    const storedOrganization = userAuthenticationService.getOrganization();

    if (storedOrganization) {
      setOrganization(storedOrganization);
      setAllUsers(storedOrganization.users);
      setAllSites(storedOrganization.sites);
    }
  }, []);

  useEffect(() => {
    onChange(control);
  }, [formValues]);
  // #endregion

  // #region Helper Functions
  const getUserObject = (userId: string): User => {
    return allUsers.find((user) => user.id === userId) as User;
  };

  const getSiteObject = (siteId: string): Site => {
    return allSites.find((site) => site.id === siteId) as Site;
  };
  // #endregion

  return (
    <>
      <div className="space-between mb-4 flex gap-5">
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Product Order Number
          </label>
          <Controller
            name={'productOrderDetails.productOrderNumber'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
          <p className="whitespace-pre-line text-sm text-red-500">
            {errors.productOrderDetails?.productOrderNumber?.message}
          </p>
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Reference Number
          </label>
          <Controller
            name={'productOrderDetails.referenceNumber'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Lot
          </label>
          <Controller
            name={'productOrderDetails.lot'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            External Product Order Number
          </label>
          <Controller
            name={'productOrderDetails.externProductOrderNumber'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
          <p className="whitespace-pre-line text-sm text-red-500">
            {errors.productOrderDetails?.externProductOrderNumber?.message}
          </p>
        </div>
      </div>
      <div className="space-between mb-4 flex gap-5">
        <div className="form-box">
          <label className="mb-3 block text-sm font-bold text-gray-700">
            Site
          </label>
          <Controller
            name={'productOrderDetails.siteRef'}
            control={control}
            render={({ field }) => (
              <select
                onChange={(e) => field.onChange(getSiteObject(e.target.value))}
                className="block w-full rounded-md border border-gray-300 px-[25px] py-2.5 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Site</option>
                {allSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Provider
          </label>
          <Controller
            name={'productOrderDetails.provider'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Client
          </label>
          <Controller
            name={'productOrderDetails.client'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
          <p className="whitespace-pre-line text-sm text-red-500">
            {errors.productOrderDetails?.client?.message}
          </p>
        </div>
      </div>

      <div className="space-between mb-4 flex gap-5">
        <div className="form-box">
          <label className="mb-3 block text-sm font-bold text-gray-700">
            Assigned To
          </label>
          <Controller
            name={'productOrderDetails.assignedUser'}
            control={control}
            render={({ field }) => (
              <select
                onChange={(e) => field.onChange(getUserObject(e.target.value))}
                className="block w-full rounded-md border border-gray-300 px-[15px] py-2.5 pl-7 pr-5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select User</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastname}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Date Created
          </label>
          <Controller
            name={'productOrderDetails.dateCreated'}
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-1 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          />
          <p className="whitespace-pre-line text-sm text-red-500">
            {errors.productOrderDetails?.dateCreated?.message}
          </p>
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Invoice Date
          </label>
          <Controller
            name={'productOrderDetails.invoiceDate'}
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-0 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          />
        </div>
      </div>
      <div className="space-between mb-4 flex gap-5">
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Quantity
          </label>
          <Controller
            name={'productOrderDetails.quantity'}
            control={control}
            render={({ field }) => (
              <StyledInput type="number" {...field} value={field.value ?? ''} />
            )}
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Product
          </label>
          <Controller
            name={'productOrderDetails.product'}
            control={control}
            render={({ field }) => (
              <StyledInput type="string" {...field} value={field.value ?? ''} />
            )}
          />
          <p className="whitespace-pre-line text-sm text-red-500">
            {errors.productOrderDetails?.product?.message}
          </p>
        </div>
      </div>
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Description
        </label>
        <Controller
          name={'productOrderDetails.description'}
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        />
      </div>
    </>
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

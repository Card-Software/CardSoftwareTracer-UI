import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as Yup from 'yup';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { User } from '@/models/user';
import { ProductOrder } from '@/models/product-order';
import type { Organization } from '@/models/organization';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { Site } from '@/models/site';
import _ from 'lodash';

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
  externalProductOrderNumber: Yup.string().matches(
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

const ProductOrderDetails: React.FC<ProductOrderDetailsProps> = ({
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      productOrderDetails: populateProductOrderDetails(),
    },
    resolver: yupResolver(productOrderFromGroupSchema),
    mode: 'onChange',
  });

  // #region States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  // #endregion

  // #region Use Refs and watchers
  const hasPageBeenRendered = useRef({ organizationLoaded: false });
  const formValues = useWatch({ control });

  // #endregion

  // #region All Use Effects
  useEffect(() => {
    if (hasPageBeenRendered.current.organizationLoaded) {
      return;
    }
    hasPageBeenRendered.current.organizationLoaded = true;
    const storedOrganization = userAuthenticationService.getOrganization();

    if (storedOrganization) {
      setAllUsers(storedOrganization.users);
      setAllSites(storedOrganization.sites);
    }
  }, []);

  const previousValues = useRef(formValues);
  useEffect(() => {
    if (!_.isEqual(previousValues.current, formValues)) {
      onChange(control);
      previousValues.current = formValues;
    }
  }, [formValues, onChange, control]);

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
    <div className="grid grid-cols-4 grid-rows-4 gap-4">
      {/* Row 1: 5 Columns */}
      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Product Order Number
        </label>
        <Controller
          name={'productOrderDetails.productOrderNumber'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <p className="whitespace-pre-line text-sm text-red-500">
          {errors.productOrderDetails?.productOrderNumber?.message}
        </p>
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Reference Number
        </label>
        <Controller
          name={'productOrderDetails.referenceNumber'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Lot
        </label>
        <Controller
          name={'productOrderDetails.lot'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          External Product Order Number
        </label>
        <Controller
          name={'productOrderDetails.externalProductOrderNumber'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <p className="whitespace-pre-line text-sm text-red-500">
          {errors.productOrderDetails?.externalProductOrderNumber?.message}
        </p>
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Assigned To
        </label>
        <Controller
          name={'productOrderDetails.assignedUser'}
          control={control}
          render={({ field }) => (
            <select
              onChange={(e) => field.onChange(getUserObject(e.target.value))}
              className="input-custom"
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

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Site
        </label>
        <Controller
          name={'productOrderDetails.siteRef'}
          control={control}
          render={({ field }) => (
            <select
              onChange={(e) => field.onChange(getSiteObject(e.target.value))}
              className="input-custom"
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

      {/* Row 2: 4 Columns */}
      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Provider
        </label>
        <Controller
          name={'productOrderDetails.provider'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Client
        </label>
        <Controller
          name={'productOrderDetails.client'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <p className="whitespace-pre-line text-sm text-red-500">
          {errors.productOrderDetails?.client?.message}
        </p>
      </div>

      <div className="form-box col-span-1">
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
              className="input-custom"
            />
          )}
        />
        <p className="whitespace-pre-line text-sm text-red-500">
          {errors.productOrderDetails?.dateCreated?.message}
        </p>
      </div>

      {/* Row 3: 4 Columns */}
      <div className="form-box col-span-1">
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
              className="input-custom"
            />
          )}
        />
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Quantity
        </label>
        <Controller
          name={'productOrderDetails.quantity'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="number"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
      </div>

      <div className="form-box col-span-1">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Product
        </label>
        <Controller
          name={'productOrderDetails.product'}
          control={control}
          render={({ field }) => (
            <input
              className="input-custom"
              type="text"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <p className="whitespace-pre-line text-sm text-red-500">
          {errors.productOrderDetails?.product?.message}
        </p>
      </div>

      {/* Row 4: 1 Column Spanning All 4 Columns */}
      <div className="form-box col-span-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Description
        </label>
        <Controller
          name={'productOrderDetails.description'}
          control={control}
          render={({ field }) => (
            <textarea {...field} className="input-custom" />
          )}
        />
      </div>
    </div>
  );
};

export default ProductOrderDetails;

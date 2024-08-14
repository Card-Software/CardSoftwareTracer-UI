import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/app/layout';
import '@/styles/traceability-stream.css';
import { HiPlus } from 'react-icons/hi';
import Link from 'next/link';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { TracerStreamExtended, TracerStream } from '@/models/tracer-stream';
import { User } from '@/models/user';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import { ProductOrder } from '@/models/product-order';
import { useRouter } from 'next/router';
import { userAuthenticationService } from '@/services/user-authentication.service';
import TracerButton from '@/components/tracer-button.component';
import TracerStreamModal from '@/components/modals/tracer-stream-modal.component'; // Ensure you import the modal component
import withAuth from '@/hoc/auth';
import LoadingOverlay from '@/components/loading-overlay.component'; // Ensure you import the LoadingOverlay component
import { TeamLabel } from '@/models/team-label';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import { useForm, Controller, set } from 'react-hook-form';
import TeamStatuses from '@/components/team-statuses.component'; // Import the TeamStatuses component
import { Status } from '@/models/Status';
import { Site } from '@/models/site';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { emailService } from '@/services/Email.service';
import SiblingProductOrdersModal from '@/components/modals/sibling-product-orders-modal.component';
import { SiblingProductOrder } from '@/models/sibling-product-order';

const NewProductOrder: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductOrder>();
  const [allProductOrders, setAllProductOrders] = useState<ProductOrder[]>([]);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [sampleUsers, setSampleUsers] = useState<User[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [connectedPOs, setConnectedPOs] = useState<ProductOrder[]>([]);
  const [connectedTracerStreams, setConnectedTracerStreams] = useState<
    TracerStreamExtended[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [createdDate, setCreatedDate] = useState<Date>(new Date());
  const [invoiceDate, setInvoiceDate] = useState<Date>();
  const [siblingPoTextDisplay, setSiblingPoTextDisplay] = useState<string>('');
  const hasPageBeenRendered = useRef({ allUsersLoaded: false });

  const [isSiblingProductOrderModalOpen, setIsSiblingProductOrderModalOpen] =
    useState(false);

  useEffect(() => {
    // Set the default value for the date input in the form
    setValue('createdDate', new Date());
    setValue('quantity', 0);
  }, [setValue]);

  useEffect(() => {
    const siblingProductOrders = watch('siblingProductOrders');
    if (siblingProductOrders) {
      if (siblingProductOrders.length === 0) {
        setSiblingPoTextDisplay('');
      } else {
        setSiblingPoTextDisplay(`(${siblingProductOrders.length}) `);
      }
    } else {
      setSiblingPoTextDisplay('');
    }
  }, [watch('siblingProductOrders')]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const organization = userAuthenticationService.getOrganization();
        if (organization === null) {
          console.error('Organization not found');
          return;
        }

        setAllSites(organization.sites || []);

        const users = await organizationManagementProxy.GetAllUsers();
        const teamLabels = await teamLabelProxy.getTeamLabelsByOrganizationName(
          organization.name,
        );
        // setAllProductOrders(productOrders);
        setSampleUsers(users);
        setTeamLabels(teamLabels);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasPageBeenRendered.current.allUsersLoaded) {
      hasPageBeenRendered.current.allUsersLoaded = true;
      fetchData();
    }
  }, []);

  const handleDateChange = (name: string, date: Date | null) => {
    if (name === 'invoiceDate' && date) {
      setValue('invoiceDate', date);
      setInvoiceDate(date);
    }
    if (name === 'createdDate' && date) {
      setValue('createdDate', date);
      setCreatedDate(date);
    }
  };

  const handleAssignUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = sampleUsers.find((user) => user.id === e.target.value);
    if (selectedUser) {
      setValue('assignedUser', selectedUser);
    }
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('siteRef', e.target.value);
  };

  const handleStatusChange = (newStatuses: Status[]) => {
    setStatuses(newStatuses);
    setValue('statuses', newStatuses);
  };

  const handleSiblingProductOrderChange = (newPOs: SiblingProductOrder[]) => {
    setValue('siblingProductOrders', newPOs);
    setIsSiblingProductOrderModalOpen(false);
  };

  const handleSiblingProductOrderCancel = () => {
    setIsSiblingProductOrderModalOpen(false);
  };

  const onSubmit = async (data: ProductOrder) => {
    const owner = userAuthenticationService.getOrganization();

    if (!owner) {
      console.error('Owner not found');
      return;
    }

    console.log(errors);

    data.ownerRef = owner.id || '';
    data.statuses = statuses; // Add the statuses to the form data
    data.childrenTracerStreams = connectedTracerStreams;
    data.childrenPosReferences = connectedPOs.map(
      (ts) => ts.productOrderNumber,
    );

    console.log(data);
    data.notes = [];
    setIsLoading(true);
    try {
      const result = await orderManagementApiProxy.createProductOrder(data);

      if (!result) {
        console.error('Failed to save Product Order');
        return;
      }
      if (process.env.NEXT_PUBLIC_ENV === 'prod') {
        emailService.sendPoCreationEmail(data.productOrderNumber);
      }

      alert('PO successfully created');

      router.push(`/Dashboard`);
    } catch (error) {
      console.error('Failed to save Product Order', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectTracerStream = (
    tracerStreamExtended: TracerStreamExtended,
  ) => {
    setConnectedTracerStreams([
      ...connectedTracerStreams,
      tracerStreamExtended,
    ]);
    setValue('childrenTracerStreams', [
      ...(watch('childrenTracerStreams') || []),
      tracerStreamExtended,
    ]);
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="mb-4">
        <Link
          href="/Dashboard"
          className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
        >
          Dashboard
        </Link>
        <span className="text-sm text-gray-500"> &gt; Add New PO</span>
      </div>
      <div className="mb-5 flex flex-row items-center">
        <div className="me-8 text-xl">
          <h1>Add New Product Order</h1>
        </div>
        <div className="flex flex-row flex-nowrap space-x-4">
          <TracerButton
            name="Add Tracer Stream"
            icon={<HiPlus />}
            onClick={() => setIsModalOpen(true)}
          />
          <TracerButton
            name={`${siblingPoTextDisplay} Sibling Pos`}
            onClick={() => setIsSiblingProductOrderModalOpen(true)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '5rem' }}>
        <div className="space-between mb-4 flex gap-5">
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Product Order
            </label>
            <input
              type="text"
              {...register('productOrderNumber', {
                required: true,
                pattern: {
                  value: /^[A-Za-z0-9\s-]+$/,
                  message:
                    'Only letters, numbers, spaces, and dashes are allowed',
                },
              })}
              className={`block w-full rounded-lg border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500
          ${errors.productOrderNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}
        `}
            />
            {errors.productOrderNumber && (
              <p className="text-sm text-red-500">
                {errors.productOrderNumber.message}
              </p>
            )}
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Reference
            </label>
            <input
              type="text"
              {...register('referenceNumber')}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Lot
            </label>
            <input
              type="text"
              {...register('lot')}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              External Product Order
            </label>
            <input
              type="text"
              {...register('externalProductOrderNumber')}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-between mb-4 flex gap-5">
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Site
            </label>
            <select
              onChange={handleSiteChange}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select an site</option>
              {allSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Provider
            </label>
            <input
              type="text"
              {...register('provider')}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Client
            </label>
            <input
              type="text"
              {...register('client')}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-between mb-4 flex gap-5">
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Assign To
            </label>
            <select
              onChange={handleAssignUser}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select an associate</option>
              {sampleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="createdDate"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Date Created
            </label>
            <DatePicker
              selected={createdDate}
              onChange={(date) => handleDateChange('createdDate', date)}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label
              htmlFor="invoiceDate"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Invoice Date
            </label>
            <DatePicker
              selected={invoiceDate}
              onChange={(date) => handleDateChange('invoiceDate', date)}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>
        <div className="space-between mb-4 flex gap-5">
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              {...register('quantity')}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Product
            </label>
            <input
              type="text"
              {...register('product')}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <TeamStatuses
            originalStatus={statuses}
            onChange={(newStatuses) => handleStatusChange(newStatuses)}
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Connected Tracer Streams
          </label>
          <div className="flex flex-wrap gap-4">
            {connectedTracerStreams.map((ts) => (
              <div
                key={ts.id}
                className="inline-block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 shadow-md"
              >
                <div className="mb-1">
                  <span className="font-bold">Name:</span> {ts.friendlyName}
                </div>
                <div className="mb-1">
                  <span className="font-bold">Product:</span> {ts.product}
                </div>
                <div className="mb-1">
                  <span className="font-bold">Quantity:</span> {ts.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="stream-footer flex bg-gray-200 p-4">
          <button
            type="button"
            className="me-6 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600"
          >
            Save
          </button>
        </footer>
      </form>
      {isModalOpen && (
        <TracerStreamModal
          originalTracerStream={null}
          onClose={() => setIsModalOpen(false)}
          onSave={handleConnectTracerStream}
          mode="add"
        />
      )}
      {isSiblingProductOrderModalOpen && (
        <SiblingProductOrdersModal
          initialSiblingProductOrders={watch('siblingProductOrders') || []}
          onClose={handleSiblingProductOrderCancel}
          onSave={handleSiblingProductOrderChange}
        />
      )}
    </Layout>
  );
};

export default withAuth(NewProductOrder);

import React, { useState, useEffect } from 'react';
import Layout from '@/app/layout';
import '../../styles/traceabilityStream.css';
import { HiPlus } from 'react-icons/hi';
import Link from 'next/link';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { TracerStreamExtended, TracerStream } from '@/models/TracerStream';
import { User } from '@/models/User';
import { organizationManagementProxy } from '@/proxies/OrganizationManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import { useRouter } from 'next/router';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import TracerButton from '@/components/TracerButton';
import TracerStreamModal from '@/components/TracerStreamModal'; // Ensure you import the modal component
import withAuth from '@/hoc/auth';
import LoadingOverlay from '@/components/LoadingOverlay'; // Ensure you import the LoadingOverlay component
import { TeamLabel } from '@/models/TeamLabel';
import { teamLabelProxy } from '@/proxies/TeamLabel.proxy';
import { useForm, Controller } from 'react-hook-form';
import TeamStatuses from '@/components/TeamStatuses'; // Import the TeamStatuses component
import { Status } from '@/models/Status';
import { Site } from '@/models/Site';

const NewProductOrder: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
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

        // const productOrders =
        //   await orderManagementApiProxy.getAllProductOrders();
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

    fetchData();
  }, []);

  const handleAssignUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = sampleUsers.find((user) => user.id === e.target.value);
    if (selectedUser) {
      setValue('assignedUser', selectedUser);
      clearErrors('assignedUser');
    } else {
      setError('assignedUser', {
        type: 'required',
        message: 'This field is required',
      });
    }
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('siteRef', e.target.value);
  };

  const handleStatusChange = (newStatuses: Status[]) => {
    setStatuses(newStatuses);
    setValue('statuses', newStatuses);
  };

  const onSubmit = async (data: ProductOrder) => {
    const owner = userAuthenticationService.getOrganization();

    if (!owner) {
      console.error('Owner not found');
      return;
    }

    data.ownerRef = owner.id || '';
    data.statuses = statuses; // Add the statuses to the form data
    data.childrenTracerStreams = connectedTracerStreams;
    data.childrenPosReferences = connectedPOs.map(
      (ts) => ts.productOrderNumber,
    );

    data.notes = [];
    setIsLoading(true);
    try {
      const result = await orderManagementApiProxy.createProductOrder(data);

      if (!result) {
        console.error('Failed to save Product Order');
        return;
      }

      router.push(`/Dashboard/po/${data.productOrderNumber}`);
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
        <div>
          <TracerButton
            name="Add Tracer Stream"
            icon={<HiPlus />}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-between mb-4 flex gap-5">
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              PO #
            </label>
            <input
              type="text"
              {...register('productOrderNumber', { required: true })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.productOrderNumber && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
          </div>
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
            {errors.assignedUser && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Client
            </label>
            <input
              type="text"
              {...register('client', { required: true })}
              className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.client && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
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
            {errors.assignedUser && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              {...register('quantity', { required: true })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
          </div>
          <div className="form-box">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Product
            </label>
            <input
              type="text"
              {...register('product', { required: true })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.product && (
              <p className="text-sm text-red-500">This field is required</p>
            )}
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Description
          </label>
          <textarea
            {...register('description', { required: true })}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-sm text-red-500">This field is required</p>
          )}
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
    </Layout>
  );
};

export default withAuth(NewProductOrder);

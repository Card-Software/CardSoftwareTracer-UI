import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/app/layout';
import Notes from '@/components/notes.component';
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
import { useForm, Controller, set, Control } from 'react-hook-form';
import TeamStatuses from '@/components/team-statuses.component'; // Import the TeamStatuses component
import { Status } from '@/models/status';
import { Site } from '@/models/site';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { emailService } from '@/services/email.service';
import SiblingProductOrdersModal from '@/components/modals/sibling-product-orders-modal.component';
import { SiblingProductOrder } from '@/models/sibling-product-order';
import ProductOrderDetails from '@/components/product-order-details';
import { Note } from '@/models/note';

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
  const [notes, setNotes] = useState<Note[]>([]);

  const user = userAuthenticationService.getUser() as User;

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

  const handleNotesChange = (notes: Note[]) => {
    setNotes(notes);
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

    data.notes = notes;
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

      router.push(`/dashboard`);
    } catch (error) {
      console.error('Failed to save Product Order', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductOrderDetailsChange = (data: Control) => {
    console.log(data);
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
          href="/dashboard"
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
        <ProductOrderDetails
          initialProductOrderDetails={null}
          onChange={(data) => {
            handleProductOrderDetailsChange(data);
          }}
        />
        <div className="my-6">
          <div className="row flex gap-10">
            <Notes
              notes={notes}
              currentUser={user}
              onChange={handleNotesChange}
            />
            <TeamStatuses
              originalStatus={statuses}
              onChange={(newStatuses) => handleStatusChange(newStatuses)}
              disableHistoryButton={true}
              onHistoryClick={() => {}}
            />
          </div>
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
            className="rounded-md bg-[var(--primary-button)] px-4 py-2 text-white hover:bg-[var(--primary-button-hover)]"
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
          isOpen={isModalOpen}
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

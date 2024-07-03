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

const NewProductOrder: React.FC = () => {
  const router = useRouter();
  const [allTracerStreams, setAllTracerStreams] = useState<TracerStream[]>([]);
  const [allProductOrders, setAllProductOrders] = useState<ProductOrder[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [connectedPOs, setConnectedPOs] = useState<ProductOrder[]>([]);
  const [filteredProductOrders, setFilteredProductOrders] = useState<
    ProductOrder[]
  >([]);
  const [connectedTracerStreams, setConnectedTracerStreams] = useState<
    TracerStreamExtended[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [product, setProduct] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [description, setDescription] = useState('');
  const [sampleUsers, setSampleUsers] = useState<User[]>([]);
  const [isPoSelected, setIsPoSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStream, setModalStream] = useState<TracerStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allProductOrders.filter((po) =>
        po.productOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProductOrders(filtered);
    } else {
      setFilteredProductOrders([]);
    }
  }, [searchTerm, allProductOrders]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tracerStreams =
          await orderManagementApiProxy.getAllTraceabilities();
        const productOrders =
          await orderManagementApiProxy.getAllProductOrders();
        const users = await organizationManagementProxy.GetAllUsers();
        setAllTracerStreams(tracerStreams);
        setAllProductOrders(productOrders);
        setSampleUsers(users);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sampleClients = [
    { id: 1, name: 'Adidas' },
    { id: 2, name: 'GAP' },
    { id: 3, name: 'Pride' },
  ];

  const handleConnectPO = (po: ProductOrder) => {
    if (!connectedPOs.some((connectedPo) => connectedPo.id === po.id)) {
      setConnectedPOs([...connectedPOs, po]);
    }
    setSearchTerm('');
    setFilteredProductOrders([]);
    setIsPoSelected(false);
  };

  const owner = userAuthenticationService.getOrganization();

  const handleSave = async () => {
    if (owner === null) {
      console.error('Owner not found');
      return;
    }
    setIsLoading(true);
    const newProductOrder: ProductOrder = {
      productOrderNumber: poNumber,
      owner: owner,
      description: description,
      notes: [], // Add relevant notes if applicable
      assignedUser: sampleUsers.find((user) => user.id === assignedUser)!,
      createdDate: new Date(),
      client: selectedClient,
      status: 'New', // Set an appropriate status
      product: product,
      quantity: quantity,
      childrenTracerStreams: connectedTracerStreams,
      childrenPosReferences: connectedPOs.map((po) => po.productOrderNumber),
    };

    try {
      await orderManagementApiProxy.createProductOrder(newProductOrder);
      alert('Product Order saved successfully!');
      router.push(`/Dashboard/po/${poNumber}`);
    } catch (error) {
      console.error('Failed to save Product Order', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectTracerStream = (
    tracerStreamExtended: TracerStreamExtended,
  ) => {
    connectedTracerStreams.push(tracerStreamExtended);
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
      <div className="space-between mb-4 flex gap-5">
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            PO #
          </label>
          <input
            type="text"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Assign To
          </label>
          <select
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an associate
            </option>
            {sampleUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastname}
              </option>
            ))}
          </select>
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Client
          </label>
          <input
            type="text"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="form-box">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Product
          </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
          className="me-6 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600"
          onClick={handleSave}
        >
          Save
        </button>
      </footer>

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

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
import { ObjectId } from 'bson';
import { useRouter } from 'next/router';
import { userAuthenticationService } from '@/services/UserAuthentication.service';

const NewProductOrder: React.FC = () => {
  const router = useRouter();
  const [allTracerStreams, setAllTracerStreams] = useState<TracerStream[]>([]);
  const [allProductOrders, setAllProductOrders] = useState<ProductOrder[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
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
  const [isStreamSelected, setIsStreamSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStream, setModalStream] = useState<TracerStream | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalProduct, setModalProduct] = useState('');

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
      const tracerStreams =
        await orderManagementApiProxy.getAllTraceabilities();
      const productOrders = await orderManagementApiProxy.getAllProductOrders();
      const users = await organizationManagementProxy.GetAllUsers();
      setAllTracerStreams(tracerStreams);
      setAllProductOrders(productOrders);
      setSampleUsers(users);
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
      // Redirect or show success message as needed
      alert('Product Order saved successfully!');
      router.push(`/Dashboard/po/${poNumber}`);
    } catch (error) {
      console.error('Failed to save Product Order', error);
      // Handle error as needed
    }
  };

  const handleConnectTracerStream = () => {
    if (modalStream) {
      const tracerStreamExtended: TracerStreamExtended = {
        ...modalStream,
        friendlyName: modalProduct,
        quantity: modalQuantity,
        product: modalProduct,
        id: new ObjectId().toHexString(),
      };

      setConnectedTracerStreams([
        ...connectedTracerStreams,
        tracerStreamExtended,
      ]);
      // if (
      //   !connectedTracerStreams.some((ts) => ts.id === tracerStreamExtended.id)
      // ) {
      //   setConnectedTracerStreams([
      //     ...connectedTracerStreams,
      //     tracerStreamExtended,
      //   ]);
      // }
      setModalStream(null);
      setModalQuantity(1);
      setModalProduct('');
      setIsModalOpen(false);
      setIsStreamSelected(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <Link
          href="/Dashboard"
          className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
        >
          Dashboard
        </Link>
        <span className="text-sm text-gray-500"> &gt; Add New PO</span>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Product Order</h1>
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
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a client
            </option>
            {sampleClients.map((client) => (
              <option key={client.id} value={client.name}>
                {client.name}
              </option>
            ))}
          </select>
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
      <div className="space-between mb-6 flex gap-5">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Traceability Stream
          </label>
          <select
            value={selectedStream}
            onChange={(e) => {
              setSelectedStream(e.target.value);
              setIsStreamSelected(true);
            }}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select a traceability stream
            </option>
            {allTracerStreams.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              const selectedStreamDetails = allTracerStreams.find(
                (ts) => ts.id === selectedStream,
              );
              if (selectedStreamDetails) {
                setModalStream(selectedStreamDetails);
                setIsModalOpen(true);
              }
            }}
            // disabled={!isStreamSelected}
          >
            Add Tracer Stream
          </button>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Connected Product Orders
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {filteredProductOrders.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-auto border border-gray-300">
              {filteredProductOrders.map((po) => (
                <li
                  key={po.id}
                  className="cursor-pointer p-2 hover:bg-gray-200"
                  onClick={() => {
                    setSearchTerm(po.productOrderNumber);
                    setIsPoSelected(true);
                  }}
                >
                  {po.productOrderNumber}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-6">
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              const selectedPoDetails = filteredProductOrders.find(
                (po) => po.productOrderNumber === searchTerm,
              );
              if (selectedPoDetails) {
                handleConnectPO(selectedPoDetails);
              }
            }}
            disabled={!isPoSelected}
          >
            Add PO Reference
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Connected Product Orders
        </label>
        <div className="flex flex-wrap gap-2">
          {connectedPOs.map((po) => (
            <span
              key={po.id}
              className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
            >
              {po.productOrderNumber} - {po.product} - {po.quantity}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Connected Tracer Streams
        </label>
        <div className="flex flex-wrap gap-2">
          {connectedTracerStreams.map((ts) => (
            <span
              key={ts.id}
              className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
            >
              {ts.friendlyName} - {ts.product} - {ts.quantity}
            </span>
          ))}
        </div>
      </div>

      <footer className="sticky bottom-0 flex justify-start space-x-2 bg-white p-4">
        <button
          className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          onClick={() => console.log('Cancel clicked')}
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleSave}
        >
          Save
        </button>
      </footer>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="w-1/3 rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Tracer Stream</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Product</label>
              <input
                type="text"
                value={modalProduct}
                onChange={(e) => setModalProduct(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Quantity</label>
              <input
                type="number"
                value={modalQuantity}
                onChange={(e) => setModalQuantity(Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectTracerStream}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NewProductOrder;

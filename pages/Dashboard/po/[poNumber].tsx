import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/app/layout';
import '../../../styles/dashboard.css';
import styled from 'styled-components';
import { FaExclamationCircle, FaArrowRight, FaPlus } from 'react-icons/fa';
import SectionModal from '@/components/SectionModal';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import Link from 'next/link';
import { Section as SectionModel } from '@/models/Section';
import { TracerStreamExtended, TracerStream } from '@/models/TracerStream';
import { ObjectId } from 'bson';
import { userAuthorizationService } from '@/services/UserAuthorization.service';
import { User } from '@/models/User';
import TracerButton from '@/components/TracerButton';
import { HiPlus } from 'react-icons/hi';
import { fileManagementService } from '@/services/FileManagement.service';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;
  const user: User = userAuthorizationService.user;
  const organization = userAuthorizationService.organization;

  const [originalProductOrder, setOriginalProductOrder] =
    useState<ProductOrder | null>(null);
  const [productOrder, setProductOrder] = useState<ProductOrder | null>(null);
  const [linkedOrders, setLinkedOrders] = useState<ProductOrder[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionModel | null>(
    null,
  );
  const [selectedStream, setSelectedStream] =
    useState<TracerStreamExtended | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTracerStreamId, setNewTracerStreamId] = useState('');
  const [newTracerStreamName, setNewTracerStreamName] = useState('');
  const [newTracerStreamProduct, setNewTracerStreamProduct] = useState('');
  const [newTracerStreamQuantity, setNewTracerStreamQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProductOrders, setFilteredProductOrders] = useState<
    ProductOrder[]
  >([]);
  const [connectedPOs, setConnectedPOs] = useState<ProductOrder[]>([]);
  const [allTracerStreams, setAllTracerStreams] = useState<TracerStream[]>([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (poNumber) {
        const order = await orderManagementApiProxy.getProductOrder(
          poNumber as string,
        );
        setOriginalProductOrder(order);
        setProductOrder(order);

        if (
          order.childrenPosReferences &&
          order.childrenPosReferences.length > 0
        ) {
          const linkedOrderDetails = await Promise.all(
            order.childrenPosReferences.map((ref) =>
              orderManagementApiProxy.getProductOrder(ref),
            ),
          );
          setLinkedOrders(linkedOrderDetails);
        }
      }
    };

    const fetchTracerStreams = async () => {
      const tracerStreams =
        await orderManagementApiProxy.getAllTraceabilities();
      setAllTracerStreams(tracerStreams);
    };

    fetchOrderDetails();
    fetchTracerStreams();
  }, [poNumber]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = linkedOrders.filter((po) =>
        po.productOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProductOrders(filtered);
    } else {
      setFilteredProductOrders([]);
    }
  }, [searchTerm, linkedOrders]);

  const handleProductOrderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProductOrder({
      ...productOrder,
      [e.target.name]: e.target.value,
    } as ProductOrder);
  };

  const handleSectionClick = (
    section: SectionModel,
    stream: TracerStreamExtended,
  ) => {
    setSelectedSection(section);
    setSelectedStream(stream);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  const hanldeExportButton = (stream: TracerStreamExtended) => {
    if (!productOrder) return;
    fileManagementService.downloadFilesFromS3Bucket(stream, productOrder);
  };

  const handleAddTracerStream = () => {
    if (newTracerStreamId && newTracerStreamName) {
      const selectedStream = allTracerStreams.find(
        (stream) => stream.id === newTracerStreamId,
      );
      if (selectedStream && productOrder) {
        const tracerStreamExtended: TracerStreamExtended = {
          ...selectedStream,
          id: new ObjectId().toHexString(),
          friendlyName: newTracerStreamName,
          quantity: newTracerStreamQuantity,
          product: newTracerStreamProduct,
        };

        setProductOrder({
          ...productOrder,
          childrenTracerStreams: [
            ...productOrder.childrenTracerStreams,
            tracerStreamExtended,
          ],
        });

        setNewTracerStreamId('');
        setNewTracerStreamName('');
        setNewTracerStreamQuantity(1);
      }
    }
  };

  const handleAddPOReference = (po: ProductOrder) => {
    if (!connectedPOs.some((connectedPo) => connectedPo.id === po.id)) {
      setConnectedPOs([...connectedPOs, po]);
    }
    setSearchTerm('');
    setFilteredProductOrders([]);
  };

  const handleSave = async () => {
    if (productOrder) {
      try {
        const response =
          await orderManagementApiProxy.updateProductOrder(productOrder);
        if (response.status === 204) {
          alert('Product Order updated successfully!');
          router.push(`/Dashboard/po/${productOrder.productOrderNumber}`);
        } else {
          alert(`Failed to save Product Order. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to save Product Order', error);
        alert('Failed to save Product Order');
      }
    }
  };

  if (!productOrder) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Container>
        <div>
          <Link
            href="/Dashboard"
            className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
          >
            Dashboard
          </Link>
          <span className="text-sm text-gray-500"> &gt; PO Details</span>
        </div>
        <Section>
          <div className="align-center my-2 mb-8 flex gap-5">
            <div>
              <h1 className="text-2xl font-bold">Product Order Details</h1>
            </div>
            <div className="flex gap-5">
              <div>
                <TracerButton
                  name="Add Tracer Stream"
                  icon={<HiPlus />}
                  onClick={() => router.push('/Dashboard/NewProductOrder')}
                />
              </div>
              {/* <div>
                <TracerButton
                  name="Add Order Reference"
                  icon={<HiPlus />}
                  onClick={() => router.push('/Dashboard/NewProductOrder')}
                />
              </div> */}
            </div>
          </div>

          <DetailItem className="mb-4 flex items-center">
            <strong className="mr-2">PO Number:</strong>
            <span>{productOrder.productOrderNumber}</span>
          </DetailItem>

          <DetailItem className="mb-4 flex items-center">
            <strong className="mr-2">External PO Number:</strong>
            <span>54322</span> {/* TODO: Make this editable */}
          </DetailItem>

          <DetailItem className="mb-4">
            <strong>Assigned to:</strong>
            <span>{productOrder.assignedUser.firstName} </span>{' '}
            {/* TODO: Make this editable. Similar to what we see in the NewProductOrder page */}
          </DetailItem>

          <DetailItem className="mb-4">
            <strong>Client:</strong>
            <span>{productOrder.client}</span> {/* TODO: Make this editable */}
          </DetailItem>

          <DetailItem className="mb-4 flex items-center">
            <label htmlFor="quantity" className="mr-2 block">
              <strong>Quantity:</strong>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={productOrder.quantity}
              onChange={(e) =>
                setProductOrder({
                  ...productOrder,
                  quantity: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-600 focus:ring-teal-600"
            />
          </DetailItem>

          <DetailItem className="mb-4">
            <label htmlFor="description" className="block">
              <strong>Description:</strong>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={productOrder.description}
              onChange={handleProductOrderChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-teal-600 focus:ring-teal-600"
            />
          </DetailItem>

          <CardContainer>
            {productOrder.childrenTracerStreams.map((stream, index) => (
              <React.Fragment key={stream.id}>
                <Card>
                  <CardTitle>
                    <div className="flex w-full flex-row justify-between">
                      <div>
                        <button
                          className="rounded bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-600"
                          onClick={() => hanldeExportButton(stream)}
                        >
                          Button for export files
                        </button>
                      </div>
                      <div className="flex flex-col">
                        <p>
                          <strong>Name:</strong> {stream.friendlyName}
                        </p>
                        <p>
                          <strong>Product:</strong> {stream.product}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {stream.quantity}
                        </p>
                      </div>
                    </div>
                  </CardTitle>
                  <SectionContainer>
                    {stream.sections.map((section, secIndex) => (
                      <React.Fragment key={section.sectionId}>
                        <SectionCard
                          onClick={() => handleSectionClick(section, stream)}
                        >
                          <CardTitle>
                            {section.sectionName}
                            <FaExclamationCircle
                              color="red"
                              style={{ marginLeft: '10px' }}
                            />
                          </CardTitle>
                          <CardDetails>
                            <DetailItem>
                              <strong>Description:</strong>{' '}
                              {section.sectionDescription}
                            </DetailItem>
                            {section.assignedUser && (
                              <DetailItem>
                                <strong>Assigned to:</strong>{' '}
                                {section.assignedUser.firstName}{' '}
                                {section.assignedUser.lastname}
                              </DetailItem>
                            )}
                            {section.notes && section.notes.length > 0 && (
                              <DetailItem>
                                <strong>Notes:</strong>
                                <ul>
                                  {section.notes.map((note) => (
                                    <li key={note.id}>{note.content}</li>
                                  ))}
                                </ul>
                              </DetailItem>
                            )}
                          </CardDetails>
                        </SectionCard>
                        {secIndex < stream.sections.length - 1 && (
                          <ArrowIcon>
                            <FaArrowRight size={24} />
                          </ArrowIcon>
                        )}
                      </React.Fragment>
                    ))}
                    <ArrowIcon>
                      <FaArrowRight size={24} />
                    </ArrowIcon>
                    <SectionCard
                      onClick={() =>
                        handleSectionClick(
                          {
                            sectionId: '',
                            sectionName: '',
                            sectionDescription: '',
                            assignedUser: user,
                            notes: [],
                            position: 0,
                            fileNameOnExport: '',
                            files: [],
                            isRequired: false,
                            owner: organization,
                          },
                          stream,
                        )
                      }
                    >
                      <AddNewButton className="rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-600">
                        Add New Section
                      </AddNewButton>
                    </SectionCard>
                  </SectionContainer>
                </Card>
              </React.Fragment>
            ))}
          </CardContainer>
        </Section>

        {/* <Section>
          <SectionTitle>Add New Tracer Stream</SectionTitle>
          <div className="mb-4 flex gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Select Traceability Stream
              </label>
              <select
                value={newTracerStreamId}
                onChange={(e) => setNewTracerStreamId(e.target.value)}
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
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Product
              </label>
              <input
                type="text"
                value={newTracerStreamProduct}
                onChange={(e) => setNewTracerStreamProduct(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={newTracerStreamName}
                onChange={(e) => setNewTracerStreamName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                value={newTracerStreamQuantity}
                onChange={(e) =>
                  setNewTracerStreamQuantity(Number(e.target.value))
                }
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              className="self-end rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={handleAddTracerStream}
            >
              <FaPlus /> Add Tracer Stream
            </button>
          </div>
        </Section> */}

        {/* <Section>
          <SectionTitle>Add Order References</SectionTitle>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700">
              Search PO
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
                    onClick={() => handleAddPOReference(po)}
                  >
                    {po.productOrderNumber}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">
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
        </Section> */}

        {/* <Section>
          <SectionTitle>Linked Product Orders</SectionTitle>
          <CardContainer>
            {linkedOrders.map((order) => (
              <Link
                href={`/Dashboard/po/${order.productOrderNumber}`}
                key={order.productOrderNumber}
              >
                <ReferenceCard>
                  <CardTitle>
                    PO Reference: {order.productOrderNumber}
                  </CardTitle>
                  <CardTitle>Product: {order.product}</CardTitle>
                  <CardTitle>Quantity: {order.quantity}</CardTitle>
                </ReferenceCard>
              </Link>
            ))}
          </CardContainer>
        </Section> */}
      </Container>
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
      {isModalOpen && selectedSection && selectedStream && (
        <SectionModal
          productOrder={productOrder.productOrderNumber}
          tracerStreamId={selectedStream.id}
          originalSection={selectedSection}
          onClose={handleCloseModal}
          onSave={(updatedSection: SectionModel) => {
            setProductOrder((prevOrder) => {
              if (!prevOrder) return null;

              const updatedStreams = prevOrder.childrenTracerStreams.map(
                (stream) =>
                  stream.id === selectedStream.id
                    ? {
                        ...stream,
                        sections: stream.sections.map((section) =>
                          section.sectionId === updatedSection.sectionId
                            ? updatedSection
                            : section,
                        ),
                      }
                    : stream,
              );

              return { ...prevOrder, childrenTracerStreams: updatedStreams };
            });

            handleCloseModal();
          }}
          mode={
            selectedSection.sectionId
              ? 'edit'
              : 'sectionCreationOnExistingTracer'
          }
        />
      )}
    </Layout>
  );
};

export default PurchaseOrderPage;

const Container = styled.div`
  padding: 20px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  flex-grow: 1;
`;

const SectionTitle = styled.h2`
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  flex-grow: 1;
`;

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SectionCard = styled(Card)`
  flex: 1 1 calc(50% - 20px); /* Two columns with a gap of 20px */
  margin-bottom: 20px;
  min-width: 0;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
`;

const CardDetails = styled.div`
  font-size: 14px;
`;

const DetailItem = styled.div`
  margin-bottom: 16px;
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 30px;
  margin: 0 5px;
`;

const AddNewButton = styled.button`
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background-color: #319795;
  }
`;

const ReferenceCard = styled(Card)`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

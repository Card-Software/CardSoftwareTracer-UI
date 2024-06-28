// pages/Dashboard/po/[poNumber].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/app/layout';
import styled from 'styled-components';
import { FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import SectionModal from '@/components/SectionModal';
import { orderManagementApiProxy } from '@/proxies/OrderManagement.proxy';
import { ProductOrder } from '@/models/ProductOrder';
import Link from 'next/link';
import { Section as SectionModel } from '@/models/Section';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;

  const [orderDetails, setOrderDetails] = useState<ProductOrder | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (poNumber) {
        const order = await orderManagementApiProxy.getProductOrder(
          poNumber as string,
        );
        setOrderDetails(order);
      }
    };

    fetchOrderDetails();
  }, [poNumber]);

  const handleSectionClick = (section: SectionModel) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  if (!orderDetails) {
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
          <SectionTitle>Purchase Order: {poNumber}</SectionTitle>
          <DetailItem>
            <strong>Description:</strong> {orderDetails.description}
          </DetailItem>
          <DetailItem>
            <strong>Assigned to:</strong> {orderDetails.assignedUser.firstName}{' '}
            {orderDetails.assignedUser.lastname}
          </DetailItem>
          <DetailItem>
            <strong>Client:</strong> {orderDetails.client}
          </DetailItem>

          <CardContainer>
            {orderDetails.childrenTracerStreams.map((stream, index) => (
              <React.Fragment key={stream.id}>
                <Card>
                  <CardTitle>
                    {stream.friendlyName} - {stream.product} - {stream.quantity}
                  </CardTitle>
                  <SectionContainer>
                    {stream.sections.map((section, secIndex) => (
                      <React.Fragment key={section.sectionId}>
                        <SectionCard
                          onClick={() => handleSectionClick(section)}
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
                    <SectionCard>
                      <AddNewButton className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
                        Add New Section
                      </AddNewButton>
                    </SectionCard>
                  </SectionContainer>
                </Card>
                {index < orderDetails.childrenTracerStreams.length - 1 && (
                  <ArrowIcon>
                    <FaArrowRight size={24} />
                  </ArrowIcon>
                )}
              </React.Fragment>
            ))}
          </CardContainer>
        </Section>

        <Section>
          <SectionTitle>Linked Product Orders</SectionTitle>
          <CardContainer>
            {orderDetails.childrenPosReferences.map((ref) => (
              <Link href={`/Dashboard/po/${ref}`} key={ref}>
                <ReferenceCard>
                  <CardTitle>PO Reference: {ref}</CardTitle>
                </ReferenceCard>
              </Link>
            ))}
          </CardContainer>
        </Section>
      </Container>
      {isModalOpen && selectedSection && (
        <SectionModal
          productOrder={orderDetails}
          section={selectedSection}
          onClose={handleCloseModal}
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
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
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
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  min-width: 100%;
`;

const SectionCard = styled(Card)`
  margin-bottom: 10px;
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

const DetailItem = styled.p`
  margin-bottom: 10px;
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 30px;
  margin: 0 5px;
`;

const AddSectionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const AddNewButton = styled.button`
  background-color: transparent;
  border: none;
  color: #000;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ReferenceCard = styled(Card)`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

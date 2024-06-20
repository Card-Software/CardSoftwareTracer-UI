import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../app/layout';
import styled from 'styled-components';
import { FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import SectionModal from '../../../components/SectionModal'; // Adjust path if necessary
import demoDocs from '../../../sample-docs/demo-docs.json';
import * as demoModels from '@/models/demo';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;
  const [orderDetails, setOrderDetails] = useState<demoModels.ProductOrder | null>(null);
  const [selectedSection, setSelectedSection] = useState<demoModels.Section | null>(null);

  useEffect(() => {
    const foundOrder = demoDocs.find(doc => doc.ProductOrder === poNumber);

    if (foundOrder) {
      setOrderDetails(foundOrder);
    }
  }, [poNumber]);

  const handleSectionClick = (section: any) => {
    setSelectedSection(section);
  };

  const handleCloseModal = () => {
    setSelectedSection(null);
  };

  if (!orderDetails) {
    return (
      <Layout>
        <Container>
          <SectionTitle>Loading...</SectionTitle>
        </Container>
      </Layout>
    );
  }

  const { TraceabilityStream } = orderDetails;

  return (
    <Layout>
      <Container>
        <Breadcrumb>
          <a href="/Dashboard" className="text-blue-500 underline hover:text-blue-700">
            Dashboard
          </a>{' '}
          -> PO details
        </Breadcrumb>
        <Section>
          <SectionTitle>
            Purchase Order: {poNumber}
          </SectionTitle>
          <CardContainer>
            {TraceabilityStream.Sections.map((section, index) => (
              <React.Fragment key={section.Position}>
                <Card onClick={() => handleSectionClick(section)}>
                  <CardTitle>
                    {section.SectionName}
                    <FaExclamationCircle color="red" style={{ marginLeft: '10px' }} />
                  </CardTitle>
                  <CardDetails>
                    <DetailItem><strong>Description:</strong> {section.SectionDescription}</DetailItem>
                    <DetailItem><strong>Assigned to:</strong> {section.assignedUser.Name}</DetailItem>
                    <DetailItem>
                      <strong>Notes:</strong>
                      <ul>
                        {section.Notes.map(note => (
                          <li key={note.id}>{note.content}</li>
                        ))}
                      </ul>
                    </DetailItem>
                    <DetailItem>
                      <a href={section.Files[0].PresignedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">
                        {section.Files[0].Name}
                      </a>
                    </DetailItem>
                  </CardDetails>
                </Card>
                {index < TraceabilityStream.Sections.length - 1 && (
                  <ArrowIcon>
                    <FaArrowRight size={24} />
                  </ArrowIcon>
                )}
              </React.Fragment>
            ))}
            <AddNewCard>
              <AddNewButton>Add New</AddNewButton>
            </AddNewCard>
          </CardContainer>
        </Section>
      </Container>
      {selectedSection && (
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

const Breadcrumb = styled.span`
  display: block;
  margin-bottom: 20px;
  font-size: 14px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
`;

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
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
  margin: 0 10px;
`;

const AddNewCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d7f8ff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
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

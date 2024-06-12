import { useRouter } from 'next/router';
import Layout from '../../../app/layout';
import styled from 'styled-components';
import { FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import React from 'react';
import { HiPlus } from 'react-icons/hi';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;

  // Dummy data for demonstration purposes
  const completedStreams = [
    {
      id: 1,
      name: 'Stream A',
      details: 'Completed details A',
      completed: true,
    },
    {
      id: 2,
      name: 'Stream B',
      details: 'Completed details B',
      completed: true,
    },
    {
      id: 3,
      name: 'Stream C',
      details: 'Completed details C',
      completed: true,
    },
  ];

  const incompleteStreams = [
    {
      id: 4,
      name: 'Stream D',
      details: 'Incomplete details D',
      completed: false,
    },
    {
      id: 5,
      name: 'Stream E',
      details: 'Incomplete details E',
      completed: false,
    },
    {
      id: 6,
      name: 'Stream F',
      details: 'Incomplete details F',
      completed: false,
    },
    {
      id: 7,
      name: 'Stream G',
      details: 'Incomplete details G',
      completed: false,
    },
  ];

  // Combine streams
  const streams = [...completedStreams, ...incompleteStreams];

  return (
    <Layout>
      <Container>
        <span className="me-8">
          <a
            href="/Dashboard"
            className="text-blue-500 underline hover:text-blue-700"
          >
            Dashboard
          </a>{' '}
          -> PO details
        </span>
        <Section>
          <SectionTitle className="flex justify-center">
            Purchase Order: {poNumber}
          </SectionTitle>
          <CardContainer>
            {streams.map((stream, index) => (
              <React.Fragment key={stream.id}>
                <Card completed={stream.completed}>
                  <CardTitle>
                    {stream.name}
                    {!stream.completed && (
                      <FaExclamationCircle
                        color="red"
                        style={{ marginLeft: '10px' }}
                      />
                    )}
                  </CardTitle>
                  <CardDetails>{stream.details}</CardDetails>
                </Card>
                <ArrowIcon>
                  <FaArrowRight size={24} />
                </ArrowIcon>
              </React.Fragment>
            ))}
            <React.Fragment>
              <AddNewCard>
                <AddNewButton>
                  Add New
                </AddNewButton>
              </AddNewCard>
            </React.Fragment>
          </CardContainer>
        </Section>
      </Container>
    </Layout>
  );
};

export default PurchaseOrderPage;

const Container = styled.div`
  padding: 60px;
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

const Card = styled.div<{ completed: boolean }>`
  background-color: ${({ completed }) => (completed ? '#e0ffe0' : '#fff')};
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  margin-top: 0;
`;

const CardDetails = styled.p`
  margin-bottom: 0;
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
`;

const AddNewButton = styled.button`
  background-color: #d7f8ff;
  border: none;
  color: #000;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

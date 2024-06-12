import { useRouter } from 'next/router';
import Layout from '../../app/layout';
import styled from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';

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
        <Title>Purchase Order: {poNumber}</Title>
        <Section>
          <SectionTitle className="flex justify-center">
            Traceability Stream
          </SectionTitle>
          <CardContainer>
            {streams.map((stream) => (
              <Card key={stream.id} completed={stream.completed}>
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
            ))}
          </CardContainer>
          <button>add new</button>
        </Section>
      </Container>
    </Layout>
  );
};

export default PurchaseOrderPage;

const Container = styled.div`
  padding: 60px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 40px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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

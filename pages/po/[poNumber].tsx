import { useRouter } from 'next/router';
import Layout from '../../app/layout';
import styled from 'styled-components';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;

  // Dummy data for demonstration purposes
  const completedStreams = [
    { id: 1, name: 'Stream A', details: 'Completed details A' },
    { id: 2, name: 'Stream B', details: 'Completed details B' },
  ];

  const incompleteStreams = [
    { id: 3, name: 'Stream C', details: 'Incomplete details C' },
    { id: 4, name: 'Stream D', details: 'Incomplete details D' },
  ];

  return (
    <Layout>
      <Container>
        <Title>Purchase Order: {poNumber}</Title>
        <Section>
          <SectionTitle>Completed Streams</SectionTitle>
          <CardContainer>
            {completedStreams.map((stream) => (
              <Card key={stream.id}>
                <CardTitle>{stream.name}</CardTitle>
                <CardDetails>{stream.details}</CardDetails>
              </Card>
            ))}
          </CardContainer>
        </Section>
        <Section>
          <SectionTitle>Incomplete Streams</SectionTitle>
          <CardContainer>
            {incompleteStreams.map((stream) => (
              <Card key={stream.id}>
                <CardTitle>{stream.name}</CardTitle>
                <CardDetails>{stream.details}</CardDetails>
              </Card>
            ))}
          </CardContainer>
        </Section>
      </Container>
    </Layout>
  );
};

export default PurchaseOrderPage;

const Container = styled.div`
  padding: 20px;
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

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  margin-top: 0;
`;

const CardDetails = styled.p`
  margin-bottom: 0;
`;

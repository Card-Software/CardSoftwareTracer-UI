import { useRouter } from 'next/router';
import Layout from '../../../app/layout';
import styled from 'styled-components';
import ProdcutOrder from '@/components/ProductOrderItem';

const WholesaleOrderPage: React.FC = () => {
  const router = useRouter();
  const { woNumber } = router.query;

  return (
    <Layout>
      <Container>
        <div>
          <a
            href="/Dashboard"
            className="cursor-pointer text-sm text-gray-500 hover:text-blue-500 hover:underline"
          >
            Dashboard
          </a>
          <span className="text-sm text-gray-500"> &gt; WO Details</span>
        </div>
        <Section>
          <SectionTitle className="flex justify-center">
            Whole Sale Order: {woNumber}
          </SectionTitle>
          <CardContainer>
            <ProdcutOrder
              poNumber={'PO002'}
              progress={3}
              assignedTo={'HSM'}
              dueDate={'08/11/2024'}
            />
            <ProdcutOrder
              poNumber={'PO003'}
              progress={3}
              assignedTo={'NSM'}
              dueDate={'08/11/2024'}
            />

            <ProdcutOrder
              poNumber={'113-345-212'}
              progress={3}
              assignedTo={'Zane Sorensen'}
              dueDate={'08/11/2024'}
            />
          </CardContainer>
        </Section>
      </Container>
    </Layout>
  );
};

export default WholesaleOrderPage;

const Container = styled.div`
  padding: 10px;
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

import { useRouter } from 'next/router';
import Layout from '../../app/layout';
import styled from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';

const WholesaleOrderPage: React.FC = () => {
  const router = useRouter();
  const { woNumber } = router.query;

  return (
    <Layout>
      <div>hello world</div>
    </Layout>
  );
};

export default WholesaleOrderPage;

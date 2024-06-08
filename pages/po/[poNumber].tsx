// pages/po/[poNumber].tsx
import { useRouter } from 'next/router';
import Layout from '../../app/layout';

const PurchaseOrderPage: React.FC = () => {
  const router = useRouter();
  const { poNumber } = router.query;

  return (
    <Layout>
      <h1>Purchase Order: {poNumber}</h1>
      {/* Add the content specific to the purchase order here */}
    </Layout>
  );
};

export default PurchaseOrderPage;

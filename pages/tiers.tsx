import { useRouter } from 'next/router';
import withAuth from '@/hoc/auth';
import Layout from '@/app/layout';
import { HiPlus } from 'react-icons/hi';
import TracerButton from '@/components/tracer-button.component';
import RequestModal from '@/components/modals/request-modal.component';

const TiersPage: React.FC = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            Requests
          </h1>
        </div>
      </div>
      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div>
        {/* // create table to show the tier, tier descriptoin, tier id and tier name */}
      </div>
      <RequestModal onClose={() => {}} />
    </Layout>
  );
};

export default withAuth(TiersPage);

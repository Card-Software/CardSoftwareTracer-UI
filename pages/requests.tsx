import { useRouter } from 'next/router';
import withAuth from '@/hoc/auth';
import Layout from '@/app/layout';
import { HiPlus } from 'react-icons/hi';
import TracerButton from '@/components/tracer-button.component';

const RequestsPage: React.FC = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            Requests
          </h1>
        </div>
        <div className="tool-bar-buttons">
          <TracerButton
            name="Start New Request"
            icon={<HiPlus />}
            onClick={() => {}}
          />
        </div>
      </div>
      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div>
        <table className="standard-table">
          <thead>
            <tr>
              <th scope="col">Product Order Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Order Number</td>
            </tr>
            <tr>
              <td>Order Number</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div />
    </Layout>
  );
};

export default withAuth(RequestsPage);

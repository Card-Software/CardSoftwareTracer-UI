import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Groups = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('admin/groups');
  }, []);
};
export default Groups;

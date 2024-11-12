import { useEffect, useState } from 'react';
import BaseModal from '../_base/base-modal.component';
import { TeamLabel } from '@/models/team-label';
import { teamLabelProxy } from '@/proxies/team-label.proxy';

import toast, { Toaster } from 'react-hot-toast';
import { Organization } from '@/models/organization';
import { userAuthenticationService } from '@/services/user-authentication.service';

interface TeamLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamLabel: TeamLabel) => void;
}

const TierModal: React.FC<TeamLabelModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  useEffect(() => {}, []);

  const handleSubmit = () => {
    // onSave
  };

  return (
    <BaseModal
      title="Tier"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
      onSave={handleSubmit}
      canSave={true}
    >
      <form action="">
        <div className="form-box">
          <label htmlFor="">Test</label>
          <input type="text" className="input-custom" />
        </div>
      </form>
    </BaseModal>
  );
};

export default TierModal;

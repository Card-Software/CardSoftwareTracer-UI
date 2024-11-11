// components/ActivityLogModal.tsx
import React from 'react';
import { ActivityLog } from '@/models/activity-log';
import { ActivityType } from '@/models/enum/activity-type';
import BaseModal from '../_base/base-modal.component';
import { TierRequest, TierRequestMaterialized } from '@/models/tier-request';

interface RequestModalProps {
  tierRequest?: TierRequestMaterialized;
  isOpen: boolean;
  onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({
  tierRequest,
  isOpen = false,
  onClose,
}) => {
  const canEdit = true;
  return (
    <BaseModal
      title="Request"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
    >
      <div className="form-box">
        <label htmlFor="">Request Id</label>
        <p>{tierRequest?.id}</p>
      </div>
      <div className="form-box">
        <label htmlFor="">Requester Organization</label>
        <p>{tierRequest?.requesterOrganizationName}</p>
      </div>
      <div className="form-box">
        <label htmlFor="">Requestee Organization</label>
        <p>{tierRequest?.requesteeOrganizationName}</p>
      </div>
      <div className="row">
        {' '}
        <div className="form-box">
          <label htmlFor="">Tier Level</label>
          <p>{tierRequest?.tierInfo.tierLevel}</p>
        </div>
        <div className="form-box">
          <label htmlFor="">Tier Name</label>
          <p>{tierRequest?.tierInfo.name}</p>
        </div>
      </div>
      <div className="form-box">
        <label htmlFor="">Request Time</label>
        <p>{tierRequest?.requestTime?.toLocaleString()}</p>
      </div>

      <div className="form-box">
        <label htmlFor="">Product Order</label>
        {canEdit ? (
          <input
            className="input-custom"
            value={tierRequest?.requesterProductOrderInfo?.productOrderNumber}
          />
        ) : (
          <p>
            {tierRequest?.requesterProductOrderInfo?.productOrderNumber ??
              'Not Completed'}{' '}
          </p>
        )}
      </div>
      <div className="form-box">
        <label htmlFor="">Tier</label>
        {canEdit ? (
          <input
            className="input-custom"
            value={tierRequest?.requesterTierReference}
          />
        ) : (
          <p>{tierRequest?.requesterTierReference ?? 'Not Completed'} </p>
        )}
      </div>

      <div className="form-box">
        <label htmlFor="">Share previous tiers?</label>
        {canEdit ? (
          <input
            className="input-custom"
            value={String(tierRequest?.sharePreviousTiers)}
          />
        ) : (
          <p>{tierRequest?.sharePreviousTiers ?? 'Not Completed'} </p>
        )}
      </div>
    </BaseModal>
  );
};

export default RequestModal;

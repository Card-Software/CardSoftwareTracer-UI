import { TierInfo } from './tier-info';

export interface TierRequest {
  id: string;
  requesterTierReference: string; //this the tier reference of the requester
  requesterOrganizationId: string;
  requesterOrganizationName: string;
  requesteeOrganizationId: string;
  requesteeOrganizationName: string;
  tierInfo: TierInfo;
  completed: boolean;
  emailRecipient: string;
  requesteeProductOrderReference?: string;
  requesteeTierReference?: string;
  sharePreviousTiers: boolean;
  requestTime?: Date;
  completedTime?: Date;
}

export interface TierRequestMaterialized extends TierRequest {
  requesterProductOrderInfo?: productOrderInfo;
}

export interface productOrderInfo {
  productOrderReference: string;
  productOrderNumber: string;
}

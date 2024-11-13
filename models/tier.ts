import { TierInfo } from './tier-info';
import { TierRequest } from './tier-request';
import { TracerStreamExtended } from './tracer-stream';

export interface TierDto {
  id: string; // mongo db
  tierInfo: TierInfo;
  stream: TracerStreamExtended;
  externalRequest: TierRequest;
}

export interface Tier {
  id: string;
  tierInfo: TierInfo;
  stream: TracerStreamExtended;
  externalRequestRef?: string;
}

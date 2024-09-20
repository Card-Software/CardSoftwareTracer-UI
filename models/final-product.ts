import { Organization } from './organization';
import { TracerStreamExtended } from './tracer-stream';
import { User } from './user';

export interface FinalProduct {
  name: string;
  product: string;
  quantity: number;
  childrenPosReferences: string[];
  childrenTracerStreams: TracerStreamExtended[];
  owner: Organization;
  assignedUser: User;
  dateCreated: Date;
}

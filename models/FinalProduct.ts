import { Organization } from './Organization';
import { TracerStreamExtended } from './TracerStream';
import { User } from './User';

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

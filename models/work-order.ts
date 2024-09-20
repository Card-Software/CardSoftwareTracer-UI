import { Organization } from './organization';
import { Section } from './section';
import { User } from './user';

export interface WorkOrder {
  id: string;
  woNumber: string;
  createdDate: Date;
  productName: string;
  sections: Section;
  organizationOwner: Organization;
  assignedManager: User;
  assignedHandler: User;
}

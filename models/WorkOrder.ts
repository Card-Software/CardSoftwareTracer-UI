import { Organization } from './Organization';
import { Section } from './Section';
import { User } from './User';

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

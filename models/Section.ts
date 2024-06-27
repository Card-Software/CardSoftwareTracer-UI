import { Note } from './Note';
import { Organization } from './Organization';
import { S3ObjectDto } from './S3ObjectDto';
import { User } from './User';

export interface Section {
  position: number; // Nullable
  sectionId: string;
  sectionName: string;
  sectionDescription: string;
  files: S3ObjectDto[]; //Can get rid of this
  fileNameOnExport: string;
  assignedUser?: User;
  notes?: Note[]; // this should be also shown in section when inherited to productOrderSection
  isRequired: boolean;
  owner: Organization;
}

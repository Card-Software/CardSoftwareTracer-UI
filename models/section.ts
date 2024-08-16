import { Note } from './note';
import { S3ObjectDto } from './s3-object-dto';
import { TeamLabel } from './team-label';
import { User } from './user';

export interface Section {
  position: number; // Nullable
  sectionId: string;
  sectionName: string;
  sectionDescription: string;
  files: S3ObjectDto[]; //Can get rid of this
  fileNameOnExport: string;
  assignedUser?: User;
  notes: Note[]; // this should be also shown in section when inherited to productOrderSection
  isRequired: boolean;
  ownerRef: string;
  teamLabels: TeamLabel[];
}
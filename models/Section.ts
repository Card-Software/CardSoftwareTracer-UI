import { S3ObjectDto } from './S3ObjectDto';
import { User } from './User';

export interface Section {
  position: number; // Nullable
  sectionName?: string;
  sectionDescription?: string;
  files: S3ObjectDto[];
  assignedUser?: User;
  notes?: string;
}

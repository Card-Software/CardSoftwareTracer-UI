import { S3ObjectDto } from './S3ObjectDto.model';
import { User } from './User.model';

export interface Section {
  position: number; // Nullable
  sectionName?: string;
  sectionDescription?: string;
  files: S3ObjectDto[];
  assignedUser?: User;
  notes?: string;
}

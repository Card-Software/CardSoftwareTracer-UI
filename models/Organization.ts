import { Site } from './Site';
import { User } from './User';

export interface Organization {
  id?: string; // Optional
  name?: string;
  users: User[];
  s3BucketName?: string;
  sites?: Site[];
}

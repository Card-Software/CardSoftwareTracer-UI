import { Site } from './Site.model';
import { User } from './User.model';

export interface Organization {
  id?: string; // Optional
  name?: string;
  users: User[];
  s3BucketName?: string;
  sites?: Site[];
}

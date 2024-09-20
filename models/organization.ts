import { Site } from './site';
import { User } from './user';

export interface Organization {
  id: string; // Optional
  name: string;
  users: User[];
  s3BucketName: string;
  sites: Site[];
}

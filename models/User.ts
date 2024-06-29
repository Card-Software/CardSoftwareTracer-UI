import { Organization } from './Organization';

export enum Role {
  Manager = 1,
  User,
  Viewer,
  Owner,
}

export interface User {
  id?: string;
  email?: string;
  password?: string;
  organization: Organization[]; // Organization type is assumed to be defined elsewhere
  roles: Dictionary; // Dictionary type is defined below
  firstName: string;
  lastname: string;
}

export interface Dictionary {
  keyValuePairs: { [key: string]: Role };
}

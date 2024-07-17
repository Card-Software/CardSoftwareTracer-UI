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
  organizationRef: string; // Organization type is assumed to be defined elsewhere
  roles: []; // Dictionary type is defined below
  firstName: string;
  lastname: string;
}

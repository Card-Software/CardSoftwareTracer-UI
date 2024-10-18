export interface TeamStatus {
  id?: string;
  name: string;
  description: string;
  createdByEmail: string;
  modifiedBy?: string;
  dateModified?: Date;
  possibleValues: string[];
  ownerId: string;
}

export interface TeamStatusExtended {
  id: string;
  name: string;
  selectedValue: string;
  feedback?: string;
  userEmail?: string;
}

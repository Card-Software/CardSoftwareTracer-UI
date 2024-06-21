export interface File {
  Name: string;
  PresignedUrl: string;
}

export interface AssignedUser {
  Name: string;
}

export interface Note {
  id: string;
  enteredDate: string;
  enteredBy: string;
  content: string;
}

export interface Section {
  Position: number;
  SectionName: string;
  SectionDescription: string;
  Files: File[];
  assignedUser: AssignedUser;
  Notes: Note[];
}

export interface TraceabilityStream {
  Id: string;
  Name: string;
  Description: string;
  Sections: Section[];
}

export interface ProductOrder {
  ProductOrder: string;
  TraceabilityStream: TraceabilityStream;
  DateEntered: string;
  EnteredBy: string;
  AssignedTo: string;
  Notes: Note[];
}

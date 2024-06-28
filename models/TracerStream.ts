import { Note } from './Note';
import { Organization } from './Organization';
import { Section } from './Section';

export interface TracerStream {
  id?: string;
  name: string;
  description: string;
  notes: Note[];
  sections: Section[];
  owner: Organization;
}

export interface TracerStreamExtended extends TracerStream {
  friendlyName: string; //default to Product Name
  quantity: number;
  product: string;
}

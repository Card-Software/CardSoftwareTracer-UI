import { Note } from './note';
import { Organization } from './organization';
import { Section } from './section';

export interface TracerStream {
  id?: string;
  name: string;
  description: string;
  notes: Note[];
  sections: Section[];
  ownerRef: string;
}

export interface TracerStreamExtended extends TracerStream {
  tracerStreamReference: string;
  friendlyName: string; //default to Product Name
  quantity: number;
  product: string;
}

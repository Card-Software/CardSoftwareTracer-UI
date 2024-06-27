import { Note } from './Note';
import { Section } from './Section';

export interface TracerStream {
  id?: string;
  name: string;
  description: string;
  notes: Note[];
  sections: Section[];
}

export interface TracerStreamExtended extends TracerStream {
  friendlyName: string; //default to Product Name
  quantity: number;
  product: string;
}

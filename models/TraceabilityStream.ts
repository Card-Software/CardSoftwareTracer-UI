import { Section } from './Section';

export interface TracerStream {
  id?: string; // Nullable, equivalent to `string?` in C#
  name: string;
  sections: Section[];
}

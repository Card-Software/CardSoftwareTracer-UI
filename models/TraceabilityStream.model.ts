import { Section } from './Section.model';

export interface TracerStream {
  id?: string; // Nullable, equivalent to `string?` in C#
  name?: string;
  sections: Section[];
}

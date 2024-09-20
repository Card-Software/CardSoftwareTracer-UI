import { User } from './user';

export interface Note {
  id?: string;
  content: string;
  enteredBy: User;
  dateEntered: Date;
}

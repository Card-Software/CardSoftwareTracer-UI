import { User } from './User';

export interface Note {
  id?: string;
  content: string;
  enteredBy: User;
  dateEntered: Date;
}

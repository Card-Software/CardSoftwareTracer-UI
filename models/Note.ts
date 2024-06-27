import { User } from './User';

export interface Note {
  content: string;
  enteredBy: User;
  dateEntered: Date;
}

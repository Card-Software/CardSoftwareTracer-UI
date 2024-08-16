import { User } from './user';

export interface View {
  id?: string;
  user?: User;
  time: Date;
  key?: string;
  bucket?: string;
}

import { User } from './User';

export interface View {
  id?: string;
  user?: User;
  time: Date;
  key?: string;
  bucket?: string;
}

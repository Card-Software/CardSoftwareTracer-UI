import { User } from './User.model';

export interface View {
  id?: string;
  user?: User;
  time: Date;
  key?: string;
  bucket?: string;
}

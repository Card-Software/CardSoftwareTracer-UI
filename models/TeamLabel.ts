import { NamedDocumentKey } from './base/NamedDocumentKey';

export interface TeamLabel {
  id: string;
  checked: boolean;
  userRef?: string;
  timeChecked: Date;
  labelName: string;
  owner: NamedDocumentKey;
}

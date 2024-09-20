import { NamedDocumentKey } from './base/named-document-key';

export interface TeamLabel {
  id: string;
  checked: boolean;
  userRef?: string;
  timeChecked: Date;
  labelName: string;
  owner: NamedDocumentKey;
}

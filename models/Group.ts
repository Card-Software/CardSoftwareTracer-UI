export interface Group {
  id?: string;
  name: string;
  description: string;
  ownerRef: string;
  membersEmail: string[];
}

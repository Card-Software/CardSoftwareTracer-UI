export interface ProductOrderSnapshot {
  productOrderNumber: string;
  assignedUserRef?: string;
  createdDate: Date;
  client: string;
  invoiceDate?: Date;
  externalProductOrderNumber?: string;
  siteRef?: string;
  planningCompletion?: number;
  planningStatus?: string;
  planningMissingSections?: string[];
  ntCompletion?: number;
  ntStatus?: string;
  ntMissingSections?: string[];
  sacCompletion?: number;
  sacStatus?: string;
  sacMissingSections?: string[];
  lot?: string;
  referenceNumber?: string;
  product?: string;
  quantity?: number;
}

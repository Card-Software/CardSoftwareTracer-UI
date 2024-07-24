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
  ntCompletion?: number;
  ntStatus?: string;
  sacCompletion?: number;
  sacStatus?: string;
}

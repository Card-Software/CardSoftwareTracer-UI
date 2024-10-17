import { Note } from './note';
import { SiblingProductOrder } from './sibling-product-order';
import { Status } from './status';
import { TracerStreamExtended } from './tracer-stream';
import { User } from './user';

export interface ProductOrder {
  id?: string;
  productOrderNumber: string;
  ownerRef: string;
  description: string;
  notes: Note[];
  assignedUser?: User | null;
  createdDate: Date;
  client: string;
  statuses: Status[];
  externalProductOrderNumber?: string;
  product: string;
  quantity?: number;
  childrenTracerStreams: TracerStreamExtended[];
  childrenPosReferences: string[];
  siteRef?: string;
  lot?: string;
  referenceNumber?: string;
  invoiceDate?: Date | null;
  provider?: string;
  siblingProductOrders: SiblingProductOrder[];
  oldProductOrderNumber?: string;
}

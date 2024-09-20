import { Note } from './note';
import { SiblingProductOrder } from './sibling-product-order';
import { Status } from './status';
import { TracerStreamExtended } from './tracer-stream';
import { User } from './user';

export interface ProductOrder {
  // we get rid momentary of whole sale orders
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
  product: string; // we are gonna force EACH PO to have a product. There should not be productless POs.or po with multiple products
  // if we were to accept product orders that have multiple products, that's where WholesaleOrder comes in.
  quantity?: number; // this is the total quantity of the product in the PO. If 0, then we dont want to track quantity.
  childrenTracerStreams: TracerStreamExtended[]; // this will have the quantity of each tracer stream that should add to parent PO.
  childrenPosReferences: string[]; //both of this will have quanitities that should add to parent PO.
  siteRef?: string;
  lot?: string;
  referenceNumber?: string;
  invoiceDate?: Date | null;
  provider?: string;
  siblingProductOrders: SiblingProductOrder[];
  // Being used becasue we moved from storing in S3 using the productOrderNumber to storing in S3 using the id.
  oldProductOrderNumber?: string;
}

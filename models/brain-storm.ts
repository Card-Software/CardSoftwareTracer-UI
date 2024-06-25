import { Organization } from './Organization';
import { TracerStream } from './TraceabilityStream';

interface PO {
  // we get rid momentary of whole sale orders
  id?: string;
  productOrder: string;
  owner: Organization;
  product?: string; // we are gonna force EACH PO to have a product. There should not be productless POs.or po with multiple products
  // if we were to accept product orders that have multiple products, that's where WholesaleOrder comes in.
  quantity?: number; // this is the total quantity of the product in the PO
  childrenTracerStreams: TracerStreamWithQty[]; // this will have the quantity of each tracer stream that should add to parent PO.
  childrenPosReferences: POWithName[]; //both of this will have quanitities that should add to parent PO.
}

interface TracerStreamWithQty extends TracerStream {
  friendlyName: string; //default to Product Name
  quantity: number;
  product: string;
}

interface POWithName extends PO {
  friendlyName: string;
}

// from here down not sure

interface WholesaleOrder {
  id: string;
  finalProducts: FinalProduct[]; // this will have the final products that are being ordered
}

interface FinalProduct {
  id: string;
  product: string;
  quantity: number;
  childrenPosReferences: POWithName[];
  childrenTracerStreams: TracerStreamWithQty[];
}

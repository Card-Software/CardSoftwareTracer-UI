import { Note } from './note';
import { SiblingProductOrder } from './sibling-product-order';
import { TeamStatusExtended } from './team-status';
import { Tier, TierDto } from './tier';
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
  teamStatuses: TeamStatusExtended[];
  externalProductOrderNumber?: string;
  product: string;
  quantity?: number;
  childrenTracerStreams: TracerStreamExtended[];
  childrenPosReferences: string[];
  // tiers: Tier[];
  siteRef?: string;
  lot?: string;
  referenceNumber?: string;
  invoiceDate?: Date | null;
  provider?: string;
  siblingProductOrders: SiblingProductOrder[];
  oldProductOrderNumber?: string;
}

export interface ProductOrderDto {
  // this is the one we shop in api.model
  id?: string;
  productOrderNumber: string;
  ownerRef: string;
  description: string;
  notes: Note[];
  assignedUser?: User | null;
  createdDate: Date;
  client: string;
  teamStatuses: TeamStatusExtended[];
  externalProductOrderNumber?: string;
  product: string;
  quantity?: number;
  tiers: TierDto[];
  siteRef?: string;
  lot?: string;
  referenceNumber?: string;
  invoiceDate?: Date | null;
  provider?: string;
  siblingProductOrders: SiblingProductOrder[];
  oldProductOrderNumber?: string;
}

import { ProductOrderSnapshot } from './product-order-snapshot';

export interface SnapshotPaginatedResult {
  totalResults: number;
  results: ProductOrderSnapshot[];
}

import { ProductOrderSnapshot } from './ProductOrderSnapshot';

export interface SnapshotPaginatedResult {
  totalResults: number;
  results: ProductOrderSnapshot[];
}

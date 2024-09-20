import { ProductOrder } from './product-order';

export interface AllResponse {
  pageSize: number;
  pageNumber: number;
  totalResults: number;
  results: ProductOrder[];
}

import { ProductOrder } from './ProductOrder';

export interface AllResponse {
  pageSize: number;
  pageNumber: number;
  totalResults: number;
  results: ProductOrder[];
}

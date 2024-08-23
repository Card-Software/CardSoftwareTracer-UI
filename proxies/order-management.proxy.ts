import { AllResponse } from '@/models/all-response';
import { PoSearchFilters } from '@/models/po-search-filter';
import { ProductOrder } from '@/models/product-order';
import { SnapshotPaginatedResult } from '@/models/snapshot-paginated-result';
import { TracerStream } from '@/models/tracer-stream';
import axiosInstance from '@/utils/axiosInstance';
class OrderManagementApiProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  //#region
  // Stream controller
  async createTraceability(traceability: TracerStream): Promise<TracerStream> {
    try {
      const response = await axiosInstance.post(
        'TracerStreams/CreateStream',
        traceability,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while creating the traceability:',
        error,
      );
      throw error;
    }
  }

  async getTraceability(name: string): Promise<TracerStream> {
    try {
      const response = await axiosInstance.get(
        `TracerStreams/GetStream/${name}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while fetching the traceability:',
        error,
      );
      throw error;
    }
  }

  async updateTraceability(
    tracerName: string,
    traceability: TracerStream,
  ): Promise<TracerStream> {
    try {
      const response = await axiosInstance.patch(
        `TracerStreams/UpdateStream/${tracerName}`,
        traceability,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while updating the traceability:',
        error,
      );
      throw error;
    }
  }

  async getAllTraceabilities(): Promise<TracerStream[]> {
    try {
      const response = await axiosInstance.get(
        'TracerStreams/GetAllTracerStreams',
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while fetching all traceabilities:',
        error,
      );
      throw error;
    }
  }
  //#endregion

  //#region
  // Product Order controller
  async createProductOrder(
    productOrder: ProductOrder,
  ): Promise<ProductOrder | null> {
    try {
      const response = await axiosInstance.post(
        'ProductOrderController/create',
        productOrder,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while creating the product order:',
        error,
      );
      throw error;
    }
  }

  async getProductOrder(id: string): Promise<ProductOrder> {
    try {
      const encoedUri = encodeURIComponent(id);
      const response = await axiosInstance.get(
        `ProductOrderController/get/${encoedUri}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while fetching the product order:',
        error,
      );
      throw error;
    }
  }

  async updateProductOrder(
    productOrder: ProductOrder,
    originalProductOderId?: string,
  ): Promise<any> {
    try {
      const poId = originalProductOderId || productOrder.id;
      const response = await axiosInstance.put(
        `ProductOrderController/update/${poId}`,
        productOrder,
      );
      return response;
    } catch (error) {
      console.error(
        'An error occurred while updating the product order:',
        error,
      );
      throw error;
    }
  }

  async deleteProductOrder(id: string): Promise<void> {
    try {
      const response = await axiosInstance.delete(
        `ProductOrderController/delete/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while deleting the product order:',
        error,
      );
      throw error;
    }
  }

  async searchProductOrders(searchTerm: string): Promise<ProductOrder[]> {
    try {
      const poEncoded = encodeURIComponent(searchTerm);
      const response = await axiosInstance.get(
        `ProductOrderController/search?po=${poEncoded}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while searching the product order:',
        error,
      );
      throw error;
    }
  }

  async searchProductOrdersSnapshots(
    filter: PoSearchFilters,
  ): Promise<SnapshotPaginatedResult> {
    try {
      const response = await axiosInstance.post(
        'ProductOrderController/snapshot/search',
        filter,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while searching the product order snapshots:',
        error,
      );
      throw error;
    }
  }

  async searchProductOrdersByFilters(
    filter: PoSearchFilters,
    pageNumber: number = 1,
    pageSize: number = 50,
  ): Promise<AllResponse> {
    try {
      const response = await axiosInstance.post(
        `ProductOrderController/search?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        filter,
      );
      return response.data;
    } catch (error) {
      console.error(
        'An error occurred while searching the product order by filters:',
        error,
      );
      throw error;
    }
  }

  async convertSnapshotSearchToExcel(filter: PoSearchFilters): Promise<Blob> {
    try {
      const response = await axiosInstance.post(
        'ProductOrderController/snapshot/excel',
        filter,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('An error occurred while converting the snapshot search to excel');
    }
  }
  //#endregion
}

export const orderManagementApiProxy = new OrderManagementApiProxy();

import ProdcutOrder from '@/components/ProductOrderItem';
import { AllResponse } from '@/models/AllResponse';
import { PoSearchFilters } from '@/models/PoSearchFilters';
import { ProductOrder } from '@/models/ProductOrder';
import { SnapshotPaginatedResult } from '@/models/SnapshotPaginatedResult';
import { TracerStream } from '@/models/TracerStream';
import { WholeSaleOrder } from '@/models/WholeSaleOrder';

class OrderManagementApiProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  //#region
  // Stream controller
  async createTraceability(traceability: TracerStream): Promise<TracerStream> {
    const response = await fetch(`${this.baseUrl}TracerStreams/CreateStream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(traceability),
    });
    return await response.json();
  }

  async getTraceability(name: string): Promise<TracerStream> {
    const nameEncoded = encodeURIComponent(name);
    const response = await fetch(
      `${this.baseUrl}TracerStreams/GetStream/${nameEncoded}`,
    );
    return await response.json();
  }

  async updateTraceability(
    tracerName: string,
    traceability: TracerStream,
  ): Promise<TracerStream> {
    const nameEncoded = encodeURIComponent(tracerName);
    const response = await fetch(
      `${this.baseUrl}TracerStreams/UpdateStream/${nameEncoded}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traceability),
      },
    );
    return await response.json();
  }

  async getAllTraceabilities(): Promise<TracerStream[]> {
    const response = await fetch(
      `${this.baseUrl}TracerStreams/GetAllTracerStreams`,
    );
    return await response.json();
  }
  //#endregion

  //#region
  // Product Order controller
  async createProductOrder(
    productOrder: ProductOrder,
  ): Promise<ProductOrder | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}ProductOrderController/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productOrder),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(
        'An error occurred while creating the product order:',
        error,
      );
      return null;
    }
  }

  async getProductOrder(id: string): Promise<ProductOrder> {
    const encoedUri = encodeURIComponent(id);
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/get/${encoedUri}`,
    );
    return await response.json();
  }

  async updateProductOrder(
    productOrder: ProductOrder,
    originalProductOderId?: string,
  ): Promise<any> {
    const poId = originalProductOderId || productOrder.id;
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/update/${poId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productOrder),
      },
    );
    return await response;
  }

  async deleteProductOrder(id: string): Promise<void> {
    await fetch(`${this.baseUrl}ProductOrderController/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllProductOrders(
    pageNumber: number = 1,
    pageSize: number = 50,
  ): Promise<AllResponse> {
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/all?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return await response.json();
  }

  async searchProductOrders(searchTerm: string): Promise<ProductOrder[]> {
    const poEncoded = encodeURIComponent(searchTerm);
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/search?po=${poEncoded}`,
    );
    return await response.json();
  }

  async searchProductOrdersSnapshots(
    filter: PoSearchFilters,
  ): Promise<SnapshotPaginatedResult> {
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/snapshot/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filter),
      },
    );
    return await response.json();
  }

  async searchProductOrdersByFilters(
    filter: PoSearchFilters,
    pageNumber: number = 1,
    pageSize: number = 50,
  ): Promise<AllResponse> {
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/search?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filter),
      },
    );
    return await response.json();
  }

  async convertSearchToCsv(filter: PoSearchFilters): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}ProductOrderController/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filter),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    return blob;
  }

  //#endregion

  //#region
  // Wholesale Order controller
  async CreateWholeSaleOrder(
    wholeSaleOrder: WholeSaleOrder,
  ): Promise<WholeSaleOrder> {
    const response = await fetch(
      `${this.baseUrl}WholeSaleOrderController/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wholeSaleOrder),
      },
    );
    return await response.json();
  }

  async getWholeSaleOrder(id: string): Promise<WholeSaleOrder> {
    const response = await fetch(
      `${this.baseUrl}WholeSaleOrderController/get/${id}`,
    );
    return await response.json();
  }

  async updateWholeSaleOrder(
    wholeSaleOrder: WholeSaleOrder,
  ): Promise<WholeSaleOrder> {
    const response = await fetch(
      `${this.baseUrl}WholeSaleOrderController/${wholeSaleOrder.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wholeSaleOrder),
      },
    );
    return await response.json();
  }

  async deleteWholeSaleOrder(id: string): Promise<void> {
    await fetch(`${this.baseUrl}WholeSaleOrderController/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllWholeSaleOrders(): Promise<WholeSaleOrder[]> {
    const response = await fetch(`${this.baseUrl}WholeSaleOrderController/all`);
    return await response.json();
  }
  //#endregion
}

export const orderManagementApiProxy = new OrderManagementApiProxy();

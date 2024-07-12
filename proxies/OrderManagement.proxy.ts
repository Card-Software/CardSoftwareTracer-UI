import ProdcutOrder from '@/components/ProductOrderItem';
import { AllResponse } from '@/models/AllResponse';
import { ProductOrder } from '@/models/ProductOrder';
import { TracerStream } from '@/models/TracerStream';
import { WholeSaleOrder } from '@/models/WholeSaleOrder';

class OrderManagementApiProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';
  private deployedUrl: string =
    process.env.NEXT_PUBLIC_TRACER_APP_API_URL_DEPLOYED || '';
  //#region
  // Stream controller
  async createTraceability(traceability: TracerStream): Promise<TracerStream> {
    const response = await fetch(
      `${this.deployedUrl}TracerStreams/CreateStream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traceability),
      },
    );
    return await response.json();
  }

  async getTraceability(name: string): Promise<TracerStream> {
    const nameEncoded = encodeURIComponent(name);
    const response = await fetch(
      `${this.deployedUrl}TracerStreams/GetStream/${nameEncoded}`,
    );
    return await response.json();
  }

  async updateTraceability(
    tracerName: string,
    traceability: TracerStream,
  ): Promise<TracerStream> {
    const nameEncoded = encodeURIComponent(tracerName);
    const response = await fetch(
      `${this.deployedUrl}TracerStreams/UpdateStream/${nameEncoded}`,
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
      `${this.deployedUrl}TracerStreams/GetAllTracerStreams`,
    );
    return await response.json();
  }
  //#endregion

  //#region
  // Product Order controller
  async createProductOrder(productOrder: ProductOrder): Promise<ProductOrder> {
    const response = await fetch(
      `${this.deployedUrl}ProductOrderController/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productOrder),
      },
    );
    return (await response) ? response.json() : null;
  }

  async getProductOrder(id: string): Promise<ProductOrder> {
    const encoedUri = encodeURIComponent(id);
    const response = await fetch(
      `${this.deployedUrl}ProductOrderController/get/${encoedUri}`,
    );
    return await response.json();
  }

  async updateProductOrder(
    productOrder: ProductOrder,
    originalProductOderId?: string,
  ): Promise<any> {
    const poId = originalProductOderId || productOrder.id;
    const response = await fetch(
      `${this.deployedUrl}ProductOrderController/update/${poId}`,
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
    await fetch(`${this.deployedUrl}ProductOrderController/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllProductOrders(
    pageNumber: number = 1,
    pageSize: number = 50,
  ): Promise<AllResponse> {
    const response = await fetch(
      `${this.deployedUrl}ProductOrderController/all?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return await response.json();
  }

  async searchProductOrders(searchTerm: string): Promise<ProductOrder[]> {
    const poEncoded = encodeURIComponent(searchTerm);
    const response = await fetch(
      `${this.deployedUrl}ProductOrderController/search?po=${poEncoded}`,
    );
    return await response.json();
  }
  //#endregion

  //#region
  // Wholesale Order controller
  async CreateWholeSaleOrder(
    wholeSaleOrder: WholeSaleOrder,
  ): Promise<WholeSaleOrder> {
    const response = await fetch(
      `${this.deployedUrl}WholeSaleOrderController/create`,
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
      `${this.deployedUrl}WholeSaleOrderController/get/${id}`,
    );
    return await response.json();
  }

  async updateWholeSaleOrder(
    wholeSaleOrder: WholeSaleOrder,
  ): Promise<WholeSaleOrder> {
    const response = await fetch(
      `${this.deployedUrl}WholeSaleOrderController/${wholeSaleOrder.id}`,
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
    await fetch(`${this.deployedUrl}WholeSaleOrderController/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllWholeSaleOrders(): Promise<WholeSaleOrder[]> {
    const response = await fetch(
      `${this.deployedUrl}WholeSaleOrderController/all`,
    );
    return await response.json();
  }
  //#endregion
}

export const orderManagementApiProxy = new OrderManagementApiProxy();

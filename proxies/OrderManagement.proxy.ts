import ProdcutOrder from '@/components/ProductOrderItem';
import { ProductOrder } from '@/models/ProductOrder';
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

  async updateTraceability(traceability: TracerStream): Promise<TracerStream> {
    const nameEncoded = encodeURIComponent(traceability.name);
    const response = await fetch(
      `${this.baseUrl}TracerStreams/UpdateStream/${nameEncoded}`,
      {
        method: 'Patch',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traceability),
      },
    );
    return await response.json();
  }

  async getAllTraceabilities(): Promise<TracerStream[]> {
    console.log('this is the base url ');
    console.log(this.baseUrl);
    console.log(process.env.NEXT_PUBLIC_ANOTHER);
    const response = await fetch(
      `${this.baseUrl}TracerStreams/GetAllTracerStreams`,
    );
    return await response.json();
  }
  //#endregion

  //#region
  // Product Order controller
  async createProductOrder(productOrder: ProductOrder): Promise<ProductOrder> {
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
    return await response.json();
  }

  async getProductOrder(id: string): Promise<ProductOrder> {
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/get/${id}`,
    );
    return await response.json();
  }

  async updateProductOrder(productOrder: ProductOrder): Promise<ProductOrder> {
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/${productOrder.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productOrder),
      },
    );
    return await response.json();
  }

  async deleteProductOrder(id: string): Promise<void> {
    await fetch(`${this.baseUrl}ProductOrderController/delete/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllProductOrders(): Promise<ProductOrder[]> {
    const response = await fetch(`${this.baseUrl}ProductOrderController/all`);
    return await response.json();
  }

  async searchProductOrders(searchTerm: string): Promise<ProductOrder[]> {
    const poEncoded = encodeURIComponent(searchTerm);
    const response = await fetch(
      `${this.baseUrl}ProductOrderController/search?po=${poEncoded}`,
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

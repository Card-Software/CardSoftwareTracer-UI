import { TracerStream } from '@/models/TracerStream';

class TraceabilityApiProxyService {
  private baseUrl: string = 'http://localhost:5002/';
  private baseUrl2: string = process.env.TRACER_APP_API_URL || '';
  //#region
  // This is a comment
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traceability),
      },
    );
    return await response.json();
  }

  async getAllTraceabilities(): Promise<TracerStream[]> {
    console.log('Tring base url ');
    console.log(this.baseUrl2);
    console.log(process.env.NEXT_PUBLIC_ANOTHER);
    const response = await fetch(
      `${this.baseUrl}TracerStreams/GetAllTracerStreams`,
    );
    return await response.json();
  }
  //#endregion

  //#region
  // Product Order controller
  async createProductOrder(productOrder: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}ProductController`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productOrder),
    });
    return await response.json();
  }

  async getProductOrder(poNumber: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}ProductController/${poNumber}`,
    );
    return await response.json();
  }

  async updateProductOrder(productOrder: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}ProductController/${productOrder}`,
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

  async getAllProductOrders(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}ProductController/all`);
    return await response.json();
  }

  async searchProductOrders(searchTerm: string): Promise<any[]> {
    const poEncoded = encodeURIComponent(searchTerm);
    const response = await fetch(
      `${this.baseUrl}ProductController/search?po=${poEncoded}`,
    );
    return await response.json();
  }
}

export const traceabilityApiProxyService = new TraceabilityApiProxyService();

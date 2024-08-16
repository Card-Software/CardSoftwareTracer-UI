import { ProductOrderCreatedEmail, PoStatusChanged } from '@/models/email';

class EmailProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async EmailPoStatusUpdate(
    recipient: string,
    poNumber: string,
    firstName: string,
  ): Promise<Response> {
    const response = await fetch(
      `${this.baseUrl}Email/EmailPO?recipient=${recipient}&PO=${poNumber}&Name=${firstName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response;
  }

  async EmailPoCreation(body: ProductOrderCreatedEmail): Promise<Response> {
    const response = await fetch(`${this.baseUrl}Email/EmailPOCreated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response;
  }

  async EmailPoStatusChanged(body: PoStatusChanged) {
    const response = await fetch(`${this.baseUrl}Email/EmailStatusChange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response;
  }
}

export const emailProxy = new EmailProxy();

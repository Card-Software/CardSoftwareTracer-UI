import { Group } from '@/models/Group';
import { S3ObjectDto } from '@/models/S3ObjectDto';

class EmailProxy {
  private deployedUrl: string =
    process.env.NEXT_PUBLIC_TRACER_APP_API_URL_DEPLOYED || '';

  async EmailPoStatusUpdate(
    recipient: string,
    poNumber: string,
    firstName: string,
  ): Promise<Response> {
    const response = await fetch(
      `${this.deployedUrl}Email/EmailPO?recipient=${recipient}&PO=${poNumber}&Name=${firstName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response;
  }
}

export const emailProxy = new EmailProxy();
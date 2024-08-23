import { ProductOrderCreatedEmail, PoStatusChanged } from '@/models/email';
import axiosInstance from '@/utils/axiosInstance';

class EmailProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async EmailPoStatusUpdate(
    recipient: string,
    poNumber: string,
    firstName: string,
  ): Promise<Response> {
    try {
      const response = await axiosInstance.post('Email/EmailPO', {
        recipient,
        poNumber,
        firstName,
      });
      return response.data;
    } catch (error) {
      throw new Error('An error occurred while sending the email');
    }
  }

  async EmailPoCreation(body: ProductOrderCreatedEmail): Promise<Response> {
    try {
      const response = await axiosInstance.post('Email/EmailPOCreated', body);
      return response.data;
    } catch (error) {
      throw new Error('An error occurred while sending the email');
    }
  }

  async EmailPoStatusChanged(body: PoStatusChanged) {
    try {
      const response = await axiosInstance.post(
        'Email/EmailStatusChange',
        body,
      );
      return response.data;
    } catch (error) {
      throw new Error('An error occurred while sending the email');
    }
  }
}

export const emailProxy = new EmailProxy();

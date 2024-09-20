import { ProductOrderCreatedEmail, PoStatusChanged } from '@/models/email';
import axiosInstance from '@/utils/axiosInstance';

class EmailProxy {
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

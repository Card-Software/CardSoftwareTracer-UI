import { S3ObjectDto } from '@/models/S3ObjectDto';

class UserAuthenticationProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async Login(email: string, password: string): Promise<{ token: string }> {
    console.log('baseUrl', this.baseUrl);

    const response = await fetch(
      `${this.baseUrl}AuthenticationController/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );
    const data = await response.json();
    return { token: data.token };
  }
}

export const userAuthenticationProxy = new UserAuthenticationProxy();

import { User } from '@/models/User';

class UserProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';
  private deployedUrl: string =
    process.env.NEXT_PUBLIC_TRACER_APP_API_URL_DEPLOYED || '';

  async updateUser(user: User): Promise<void> {
    const response = await fetch(
      `${this.deployedUrl}UserController/update/${user.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      },
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to update user: ${errorMessage}`);
    }

    // If the server returns a 204 No Content, there's no body to parse
    if (response.status !== 204) {
      return await response.json();
    }
  }
}

export const userProxy = new UserProxy();

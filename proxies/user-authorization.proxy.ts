import { Group } from '@/models/group';
import { S3ObjectDto } from '@/models/s3-object-dto';

class UserAuthorizationProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async getAllGroups(ownerRef: string): Promise<Group[]> {
    const response = await fetch(
      `${this.baseUrl}GroupsController/${ownerRef}/all`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await response.json();
    return data;
  }
}

export const userAuthorizationProxy = new UserAuthorizationProxy();

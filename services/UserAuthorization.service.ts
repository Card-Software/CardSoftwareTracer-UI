import { Organization } from '@/models/Organization';
import { User } from '@/models/User';
import { organizationManagementProxy } from '@/proxies/OrganizationManagement.proxy';

class UserAuthorizationService {
  //make api call to get organization
  organization: Organization = {
    id: '1',
    name: 'Organization 1',
    users: [],
    s3BucketName: 'bucket1',
    sites: [],
  };

  user: User = {
    id: '1',
    firstName: 'User 1',
    lastname: 'User 1',
    email: '',
    password: '',
    organization: [],
    roles: { keyValuePairs: {} },
  };

  //make call using async
  async getOrganization() {
    this.organization = await organizationManagementProxy.GetOrganization(
      '667df96ca449e088a9bd8046',
    );
    console.log(this.organization);
  }

  async getUser() {
    this.user = await organizationManagementProxy.GetUser(
      '6676fa30216dcfa58f98284d',
    );
  }

  constructor() {
    this.getOrganization();
    this.getUser();
  }
}

export const userAuthorizationService = new UserAuthorizationService();

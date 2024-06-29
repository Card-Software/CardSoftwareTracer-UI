import { Organization } from '@/models/Organization';
import { User } from '@/models/User';

class OrganizationManagementProxy {
  baseUrl = process.env.NEXT_PUBLIC_TRACER_APP_API_URL;

  //#region
  // Organization controller
  async CreateOrganization(organization: Organization): Promise<Organization> {
    const response = await fetch(
      `${this.baseUrl}OrganizationController/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      },
    );
    return await response.json();
  }

  async GetOrganization(id: string): Promise<Organization> {
    const response = await fetch(
      `${this.baseUrl}OrganizationController/get/${id}`,
    );
    return await response.json();
  }

  async UpdateOrganization(organization: Organization): Promise<Organization> {
    const response = await fetch(
      `${this.baseUrl}OrganizationController/update/${organization.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      },
    );
    return await response.json();
  }

  async GetAllEnterprises(): Promise<Organization[]> {
    const response = await fetch(`${this.baseUrl}OrganizationController/all`);
    return await response.json();
  }

  async DeleteEnterprise(id: string): Promise<Organization> {
    const response = await fetch(
      `${this.baseUrl}OrganizationController/delete/${id}`,
      {
        method: 'DELETE',
      },
    );
    return await response.json();
  }
  //#endregion

  //#region
  // User controller
  async CreateUser(user: User): Promise<User> {
    const response = await fetch(`${this.baseUrl}UserController/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return await response.json();
  }

  async GetUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}UserController/get/${id}`);
    return await response.json();
  }

  async UpdateUser(user: User): Promise<User> {
    const response = await fetch(
      `${this.baseUrl}UserController/update/${user.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      },
    );
    return await response.json();
  }

  async GetAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}UserController/all`);
    return await response.json();
  }

  async DeleteUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}UserController/delete/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  }
}

export const organizationManagementProxy = new OrganizationManagementProxy();

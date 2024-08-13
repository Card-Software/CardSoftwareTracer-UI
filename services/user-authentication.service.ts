import { Organization } from '@/models/organization';
import { User } from '@/models/user';
import { userAuthenticationProxy } from '@/proxies/user-authentication.proxy';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import router, { NextRouter } from 'next/router';
import { userAuthorizationProxy } from '@/proxies/user-authorization.proxy';
import { Group } from '@/models/group';

class UserAuthenticationService {
  private user: User | null = null;
  private organization: Organization | null = null;
  private IsAdmin = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    const token = localStorage.getItem('CSTracerUserJWT');
    if (token && this.isTokenValid()) {
      console.log('Token is valid');
    } else {
      this.logout();
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await userAuthenticationProxy.Login(email, password);
      if (response.token) {
        localStorage.setItem('CSTracerUserJWT', response.token);
        await this.fetchUserData(response.token);
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }

    return false;
  }

  private async fetchUserData(token: string): Promise<void> {
    const decodedToken = this.decodeToken(token);
    const userId = decodedToken.UserId;
    const organizationId = decodedToken.OrganizationId;

    userAuthorizationProxy.getAllGroups(organizationId).then((groups) => {
      localStorage.setItem('CSTracerGroups', JSON.stringify(groups));
    });

    try {
      const [userResponse, organizationResponse] = await Promise.all([
        organizationManagementProxy.GetUser(userId),
        organizationManagementProxy.GetOrganization(organizationId),
      ]);

      if (userResponse.role.includes('Admin')) {
        this.IsAdmin = true;
      }

      this.user = userResponse;
      this.organization = organizationResponse;

      localStorage.setItem('CSTracerUser', JSON.stringify(this.user));
      localStorage.setItem(
        'CSTracerOrganization',
        JSON.stringify(this.organization),
      );
    } catch (error) {
      console.error('Failed to fetch user or organization data:', error);
    }
  }

  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  }

  isTokenValid(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('CSTracerUserJWT');
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    const exp = decodedToken.exp;
    const now = Math.floor(Date.now() / 1000);

    if (exp <= now) return false;

    const user = localStorage.getItem('CSTracerUser');
    const organization = localStorage.getItem('CSTracerOrganization');
    if (!user || !organization) return false;

    return true;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CSTracerUserJWT');
      localStorage.removeItem('CSTracerUser');
      localStorage.removeItem('CSTracerOrganization');
    }
    this.user = null;
    this.organization = null;
    // router.push('/login');
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('CSTracerUserJWT') ? true : false;
  }

  getGroups(): Group[] {
    return JSON.parse(localStorage.getItem('CSTracerGroups') || '[]');
  }

  getFirstName(): string {
    return this.user ? this.user.firstName : '';
  }

  getLastName(): string {
    return this.user ? this.user.lastname : '';
  }

  getFullName(): string {
    return `${this.getFirstName()} ${this.getLastName()}`;
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const user = this.user
      ? this.user
      : JSON.parse(localStorage.getItem('CSTracerUser') || 'null');
    if (user) {
      return user;
    } else {
      this.logout();
      return null;
    }
  }

  getOrganization(): Organization | null {
    if (typeof window === 'undefined') return null;

    const organization = this.organization
      ? this.organization
      : JSON.parse(localStorage.getItem('CSTracerOrganization') || 'null');

    if (organization) {
      return organization;
    } else {
      this.logout();
      return null;
    }
  }
}

export const userAuthenticationService = new UserAuthenticationService();

import { Organization } from '@/models/Organization';
import { User } from '@/models/User';
import { userAuthenticationProxy } from '@/proxies/UserAuthentication.proxy';
import { organizationManagementProxy } from '@/proxies/OrganizationManagement.proxy';
import router, { NextRouter } from 'next/router';
import { userAuthorizationProxy } from '@/proxies/UserAuthorizationProxy.proxy';
import { Group } from '@/models/Group';
import { emailProxy } from '@/proxies/Email.proxy';

class EmailService {
  sendEmailToGroup(group: Group, poNumber: string, body: string): void {
    group.membersEmail.forEach((email) => {
      emailProxy.EmailPoStatusUpdate(email, poNumber, '');
    });
  }
}

export const emailService = new EmailService();

import { User } from '@/models/user';
import { userAuthenticationService } from './user-authentication.service';
import { emailProxy } from '@/proxies/email.proxy';
import { ProductOrderCreatedEmail, PoStatusChanged } from '@/models/email';

class EmailService {
  user = userAuthenticationService.getUser() as User;
  allUsers = userAuthenticationService.getOrganization()?.users as User[];

  sendPoUpdateEmailToAllUsers(
    poNumber: string,
    team: string,
    status: string,
  ): void {
    const emails = this.allUsers.map((user) => user.email as string);
    const data: PoStatusChanged = {
      recipient: emails,
      poNumber: poNumber,
      team: team,
      status: status,
      emailOfChange: this.user.email as string,
    };
    emailProxy.EmailPoStatusChanged(data);
  }

  sendPoCreationEmail(poNumber: string): void {
    const emails = this.allUsers.map((user) => user.email as string);
    const data: ProductOrderCreatedEmail = {
      recipient: emails,
      poNumber: poNumber,
      emailOfChange: this.user.email as string,
    };
    emailProxy.EmailPoCreation(data);
  }
}

export const emailService = new EmailService();

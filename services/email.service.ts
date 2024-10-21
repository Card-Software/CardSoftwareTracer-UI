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
    this.allUsers.forEach((user) => {
      if (user.email) {
        const data: PoStatusChanged = {
          recipient: [user.email],
          poNumber: poNumber,
          // name: user.firstName + ' ' + user.lastname,
          emailOfChange: this.user.email as string,
          team: team,
          status: status,
        };
        emailProxy.EmailPoStatusChanged(data);
      }
    });
  }

  sendPoCreationEmail(poNumber: string): void {
    this.allUsers.forEach((user) => {
      if (user.email) {
        const data: ProductOrderCreatedEmail = {
          recipient: [user.email],
          poNumber: poNumber,
          // name: user.firstName + ' ' + user.lastname,
          emailOfChange: this.user.email as string,
        };
        emailProxy.EmailPoCreation(data);
      }
    });
  }
}

export const emailService = new EmailService();

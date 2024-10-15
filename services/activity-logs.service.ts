import { ActivityLog } from '@/models/activity-log';
import { ProductOrder } from '@/models/product-order';
import { ActivityType } from '@/models/enum/activity-type';
import { userAuthenticationService } from './user-authentication.service';
import { activityLogProxy } from '@/proxies/activity-log.proxy';
import { emailService } from '@/services/email.service';
import { Status } from '@/models/status';

class ActivityLogService {
  private user = userAuthenticationService.getUser();

  insertLogs(
    productOrder: ProductOrder,
    originalProductOrder: ProductOrder | null,
  ) {
    if (!productOrder || !originalProductOrder) return;

    productOrder.statuses.forEach((status) => {
      const originalStatus = originalProductOrder?.statuses.find(
        (s) => s.team === status.team,
      );
      if (originalStatus?.teamStatus !== status.teamStatus) {
        const activityLog: ActivityLog = {
          productOrderReference: productOrder.id as string,
          activityType: 'Status Change',
          team: status.team,
          teamStatus: status.teamStatus,
          productOrderNumber: productOrder?.productOrderNumber || '',
          userFirstName: this.user?.firstName || '',
          userLastName: this.user?.lastname || '',
          timeStamp: new Date(),
          feedBack: status.teamStatus === 'Returned' ? status.feedback : '',
        };

        activityLogProxy.insertActivityLog(activityLog);

        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
          this.sendEmailNotifications(status, productOrder);
        }
      }
    });

    originalProductOrder.statuses = productOrder.statuses;
  }

  getUpdatedLogs = async (productOrderRef: string): Promise<ActivityLog[]> => {
    try {
      const logs = await activityLogProxy.getActivityLogByPo(productOrderRef);
      return logs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  };

  private sendEmailNotifications(status: Status, productOrder: ProductOrder) {
    const poNumber = productOrder?.productOrderNumber || '';

    if (status.team === 'Planning' && status.teamStatus === 'Completed') {
      emailService.sendPoUpdateEmailToAllUsers(
        poNumber,
        'Planning',
        'Completed',
      );
    } else if (status.team === 'SAC' && status.teamStatus === 'Returned') {
      emailService.sendPoUpdateEmailToAllUsers(poNumber, 'SAC', 'Returned');
    } else if (
      status.team === 'Planning' &&
      status.teamStatus === 'Accomplish'
    ) {
      emailService.sendPoUpdateEmailToAllUsers(
        poNumber,
        'Planning',
        'Accomplish',
      );
    }
  }
}

export const activityLogService = new ActivityLogService();

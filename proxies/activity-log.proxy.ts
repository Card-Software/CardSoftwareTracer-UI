import { ActivityLog } from '@/models/activity-log';
import { Group } from '@/models/group';
import { S3ObjectDto } from '@/models/s3-object-dto';

class ActivityLogProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async insertActivityLog(activityLog: ActivityLog): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}ActivityLogController/insert`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityLog),
      },
    );
    return response.ok;
  }

  async getActivityLogByPo(po: string): Promise<ActivityLog[]> {
    const response = await fetch(
      `${this.baseUrl}ActivityLogController/getbyPo/${po}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.ok) {
      return await response.json();
    }
    return [];
  }
}

export const activityLogProxy = new ActivityLogProxy();

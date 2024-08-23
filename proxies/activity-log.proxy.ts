import { ActivityLog } from '@/models/activity-log';
import axiosInstance from '@/utils/axiosInstance';
class ActivityLogProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async insertActivityLog(activityLog: ActivityLog): Promise<boolean> {
    try {
      const response = await axiosInstance.post(
        'ActivityLogController/insert',
        activityLog,
      );
      return response.data;
    } catch (error) {
      throw new Error('An error occurred while inserting the activity log');
    }
  }

  async getActivityLogByPo(po: string): Promise<ActivityLog[]> {
    try {
      const response = await axiosInstance.get(
        `ActivityLogController/getbyPo/${po}`,
      );
      return response.data;
    } catch (error) {
      throw new Error('An error occurred while getting the activity log by PO');      
    }
  }
}

export const activityLogProxy = new ActivityLogProxy();

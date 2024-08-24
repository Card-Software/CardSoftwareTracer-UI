import { ActivityLog } from '@/models/activity-log';
import axiosInstance from '@/utils/axiosInstance';
import { GiConsoleController } from 'react-icons/gi';
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
    } catch (error: any) {
      // console.error('An error occurred while fetching the activity log:', error);
      return [];
    }
  }
}

export const activityLogProxy = new ActivityLogProxy();

// import { ActivityLog } from '@/models/activity-log';
// import { Group } from '@/models/group';
// import { S3ObjectDto } from '@/models/s3-object-dto';

// class ActivityLogProxy {
//   private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

//   async insertActivityLog(activityLog: ActivityLog): Promise<boolean> {
//     const response = await fetch(
//       `${this.baseUrl}ActivityLogController/insert`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(activityLog),
//       },
//     );
//     return response.ok;
//   }

//   async getActivityLogByPo(po: string): Promise<ActivityLog[]> {
//     const response = await fetch(
//       `${this.baseUrl}ActivityLogController/getbyPo/${po}`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     );
//     if (response.ok) {
//       return await response.json();
//     }
//     return [];
//   }
// }

// export const activityLogProxy = new ActivityLogProxy();

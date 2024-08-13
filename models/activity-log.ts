export interface ActivityLog {
  id?: string;
  userIdRef?: string;
  userFirstName?: string;
  userLastName?: string;
  activityType?: string;
  productOrderNumber?: string;
  fileName?: string;
  timeStamp: Date;
  team?: string;
  teamStatus?: string;
  feedBack?: string;
  traceabilityStream?: string;
  section?: string;
}

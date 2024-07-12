export interface PoSearchFilters {
  productOrderNumber: string | null;
  externalPoNumber: string | null;
  startDate: moment.Moment | null;
  endDate: moment.Moment | null;
  siteRef: string | null;
  planningStatus: string | null;
  ntStatus: string | null;
  sacStatus: string | null;
  assignedUserRef: string | null;
}

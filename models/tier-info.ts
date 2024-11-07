export interface TierInfo {
  id: string;
  name: string;
  tierLevel: number;
  description: string;
}

export interface TierCustomer {
  tierReference: string;
  preferredDescripion: string;
}

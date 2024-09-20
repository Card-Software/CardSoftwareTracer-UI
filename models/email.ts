export interface PoStatusChanged extends ProductOrderCreatedEmail {
  team: string;
  status: string;
}

export interface ProductOrderCreatedEmail {
  recipient: string;
  poNumber: string;
  name: string;
  emailOfChange: string;
}

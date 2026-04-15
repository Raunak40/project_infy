export interface CustomerDTO {
  id: number;
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  taxId: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

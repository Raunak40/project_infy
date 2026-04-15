export interface PlanDTO {
  id: number;
  name: string;
  price: number;
  billingFrequency: string;
  currency: string;
  status: string;
  setupFee: number;
  trialPeriodDays: number;
  taxApplicable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDTO {
  id: number;
  customerId: number;
  customerName: string;
  customerCode: string;
  planId: number;
  planName: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  planPriceSnapshot: number;
  planNameSnapshot: string;
  currency: string;
  cancellationReason: string;
  suspensionReason: string;
  createdAt: string;
  updatedAt: string;
}

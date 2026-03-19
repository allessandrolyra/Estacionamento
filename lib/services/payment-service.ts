export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentService {
  processPayment(
    amount: number,
    metadata: Record<string, unknown>
  ): Promise<PaymentResult>;
}

export class InternalPaymentService implements PaymentService {
  async processPayment(
    amount: number,
    _metadata: Record<string, unknown>
  ): Promise<PaymentResult> {
    if (amount < 0) return { success: false, error: "Valor inválido" };
    return { success: true };
  }
}

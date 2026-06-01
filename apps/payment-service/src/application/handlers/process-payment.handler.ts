import type { ProcessPaymentCommand } from "../commands/process-payment.command.js";
import type { EventPublisher } from "../ports/event-publisher.js";
import type { PaymentGateway } from "../ports/payment-gateway.js";
import type { PaymentRepository } from "../ports/payment.repository.js";

export class ProcessPaymentHandler {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: ProcessPaymentCommand): Promise<void> {
    const pendingPayment = await this.paymentRepository.createPendingPayment(
      command,
      this.paymentGateway.provider,
    );

    if (!pendingPayment.shouldProcessGateway) {
      if (!pendingPayment.pendingResultOutboxEventId) {
        return;
      }

      await this.eventPublisher.publishPendingPaymentResultEvent(
        pendingPayment.pendingResultOutboxEventId,
      );
      return;
    }

    if (!pendingPayment.attemptId) {
      throw new Error("Missing payment attempt for gateway processing");
    }

    const gatewayResult = await this.paymentGateway.createPayment({
      paymentId: pendingPayment.payment.internalCode,
      reservationId: pendingPayment.payment.reservationId,
      amount: Number(pendingPayment.payment.amount),
      currencyCode: pendingPayment.payment.currencyCode,
      customerReference: String(command.guestId),
      idempotencyKey: command.correlationId,
    });

    const result = await this.paymentRepository.registerGatewayResult({
      paymentId: pendingPayment.payment.id,
      attemptId: pendingPayment.attemptId,
      gatewayResult,
      causationId: command.causationId,
      correlationId: command.correlationId,
      currencyCode: pendingPayment.payment.currencyCode,
    });

    if (!result.pendingResultOutboxEventId) {
      return;
    }

    await this.eventPublisher.publishPendingPaymentResultEvent(
      result.pendingResultOutboxEventId,
    );
  }
}
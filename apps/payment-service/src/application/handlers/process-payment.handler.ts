import { ProcessPaymentCommand } from "../commands/process-payment.comand.js";
import { EventPublisher } from "../ports/event-publishers.js";
import type { PaymentRepository } from "../ports/payment.repository.js";

export class ProcessPaymentHandler {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: ProcessPaymentCommand): Promise<void> {
    const result = await this.paymentRepository.processPayment(command);

    if (!result.pendingResultOutboxEventId) {
      return;
    }

    await this.eventPublisher.publishPendingPaymentResultEvent(
      result.pendingResultOutboxEventId,
    );
  }
}
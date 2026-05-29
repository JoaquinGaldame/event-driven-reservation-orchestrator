import type { LockInventoryCommand } from "../commands/lock-inventory.command.js";
import type { EventPublisher } from "../ports/event-publisher.js";
import type { InventoryLockRepository } from "../ports/inventory-lock.repository.js";

export class LockInventoryHandler {
  constructor(
    private readonly inventoryLockRepository: InventoryLockRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: LockInventoryCommand): Promise<void> {
    const result = await this.inventoryLockRepository.lockInventory(command);

    if (!result.pendingResultOutboxEventId) {
      return;
    }

    await this.eventPublisher.publishPendingInventoryResultEvent(
      result.pendingResultOutboxEventId,
    );
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DomainEvent } from "./DomainEvent"

type Handler<T extends DomainEvent> = (event: T) => Promise<void> | void

export class EventBus {
  private handlers = new Map<string, Handler<any>[]>()

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: Handler<T>
  ) {
    const list = this.handlers.get(eventName) ?? []
    list.push(handler)
    this.handlers.set(eventName, list)
  }

  async publish(events: DomainEvent[]) {
    for (const event of events) {
      const handlers = this.handlers.get(event.name) ?? []
      for (const handler of handlers) {
        await handler(event)
      }
    }
  }
}

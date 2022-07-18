export type NotificationListener = {
  stop(): void
}

export interface INotificationBroker {
  on(topic: string, handler: () => void): NotificationListener
}

class EventSourceNotificationBroker implements INotificationBroker {

  eventSource: EventSource

  constructor() {
    this.eventSource = new EventSource("/api/sse");
  }

  on(topic: string, handler: () => void): NotificationListener {
    this.eventSource.addEventListener(topic, handler);

    return {
      stop: () => {
        this.eventSource.removeEventListener(topic, handler)
      }
    }
  }
}

let notificationBroker: INotificationBroker

export function useEventSource(): INotificationBroker {
  if (!notificationBroker) {
    notificationBroker = new EventSourceNotificationBroker()
  }

  return notificationBroker
}
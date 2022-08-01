const Url = require('domurl')

let eventAuthToken: string | null = null

export function setEventAuthToken(authToken: string) {
  eventAuthToken = authToken
  notificationBrokerMap.clear()
}

export type NotificationListener = {
  stop(): void
}

export interface INotificationBroker {
  on(topic: string, handler: () => void): NotificationListener
}

class EventSourceNotificationBroker implements INotificationBroker {

  eventSource: EventSource

  constructor(private url: string) {
    const url_ = new Url(url)
    if (eventAuthToken) {
      url_.query['token'] = eventAuthToken
    }

    this.eventSource = new EventSource(url_.toString());
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

const notificationBrokerMap = new Map<string, INotificationBroker>()

export function useEventSource(url: string): INotificationBroker {

  if (!notificationBrokerMap.has(url)) {
    notificationBrokerMap.set(url, new EventSourceNotificationBroker(url))
  }

  return notificationBrokerMap.get(url)!
}
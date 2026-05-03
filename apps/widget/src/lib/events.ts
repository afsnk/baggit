function subscribe(
  eventName: EventName,
  listener: EventListenerOrEventListenerObject,
) {
  document.addEventListener(eventName, listener)
}

function unsubscribe(
  eventName: EventName,
  listener: EventListenerOrEventListenerObject,
) {
  document.removeEventListener(eventName, listener)
}

function publish(eventName: EventName, data?: any) {
  const event = new CustomEvent(eventName, { detail: data })
  document.dispatchEvent(event)
}

enum CustomEvents {
  FetchingQuote = 'fetchingQuote',
  QuoteFetched = 'quoteFetched',
}

type EventName = keyof typeof CustomEvents

export { publish, subscribe, unsubscribe, CustomEvents }

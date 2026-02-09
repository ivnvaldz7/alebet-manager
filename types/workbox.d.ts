interface WorkboxLifecycleWaitingEvent {
  readonly isUpdate?: boolean
  readonly isExternal?: boolean
  readonly sw: ServiceWorker
  readonly originalEvent: Event
}

interface WorkboxLifecycleEvent {
  readonly isUpdate?: boolean
  readonly isExternal?: boolean
  readonly sw?: ServiceWorker
  readonly originalEvent?: Event
}

interface WorkboxMessageEvent {
  readonly data: any
  readonly originalEvent: Event
  readonly ports: readonly MessagePort[]
}

interface Workbox {
  readonly controlling?: ServiceWorker
  readonly active?: ServiceWorker
  readonly waiting?: ServiceWorker
  readonly installing?: ServiceWorker

  addEventListener(
    type: 'waiting',
    listener: (event: WorkboxLifecycleWaitingEvent) => void
  ): void
  addEventListener(
    type: 'controlling',
    listener: (event: WorkboxLifecycleEvent) => void
  ): void
  addEventListener(
    type: 'installed',
    listener: (event: WorkboxLifecycleEvent) => void
  ): void
  addEventListener(
    type: 'activated',
    listener: (event: WorkboxLifecycleEvent) => void
  ): void
  addEventListener(
    type: 'message',
    listener: (event: WorkboxMessageEvent) => void
  ): void

  removeEventListener(
    type: string,
    listener: (event: any) => void
  ): void

  messageSW(data: any): Promise<any>
  messageSkipWaiting(): void

  register(options?: RegistrationOptions): Promise<ServiceWorkerRegistration>
  update(): Promise<void>
  getSW(): Promise<ServiceWorker | undefined>
}

interface Window {
  workbox?: Workbox
}

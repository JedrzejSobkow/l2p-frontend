import { Manager, type ManagerOptions, type Socket, type SocketOptions } from 'socket.io-client'

const API_BASE_URL = (import.meta.env?.VITE_SOCKET_IO_URL ?? '') as string
const TRIMMED_BASE = API_BASE_URL.replace(/\/$/, '')
const SOCKET_URL = TRIMMED_BASE || undefined
const SOCKET_PATH = '/socket.io'

const managerOptions: ManagerOptions = {
  path: SOCKET_PATH,
  transports: ['websocket'],
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  autoConnect: false,
  forceNew: false,
  multiplex: true,
  timeout: 20000,
  randomizationFactor: 0.5,
  parser: undefined,
}

let manager: Manager | null = null
const namespaceSockets = new Map<string, Socket>()

const normalizeNamespace = (namespace: string) =>
  namespace.startsWith('/') ? namespace : `/${namespace}`

const getManager = () => {
  if (!manager) {
    manager = new Manager(SOCKET_URL, managerOptions)
  }
  return manager
}

export const getNamespaceSocket = (
  namespace: string,
  options?: Partial<SocketOptions> & { auth?: Record<string, unknown> },
): Socket => {
  const normalizedNamespace = normalizeNamespace(namespace)

  if (!namespaceSockets.has(normalizedNamespace)) {
    const socket = getManager().socket(normalizedNamespace, options)
    socket.on('connect_error', (err: any) => {
      console.error(`${normalizedNamespace} socket connect_error:`, err?.message, err.data)
    })
    namespaceSockets.set(normalizedNamespace, socket)
  }

  const socket = namespaceSockets.get(normalizedNamespace)!

  if (options?.auth) {
    socket.auth = options.auth
  }

  return socket
}

export const connectNamespaceSocket = (
  namespace: string,
  options?: Partial<SocketOptions> & { auth?: Record<string, unknown> },
): Socket => {
  const socket = getNamespaceSocket(namespace, options)

  if (!socket.connected) {
    console.log(`Connecting to ${namespace} socket...`)
    socket.connect()
  }

  return socket
}

export const disconnectNamespaceSocket = (namespace: string): void => {
  const normalizedNamespace = normalizeNamespace(namespace)
  const socket = namespaceSockets.get(normalizedNamespace)

  if (socket) {
    socket.disconnect()
    namespaceSockets.delete(normalizedNamespace)
  }

  if (namespaceSockets.size === 0 && manager) {
    manager._close()
    manager = null
  }
}

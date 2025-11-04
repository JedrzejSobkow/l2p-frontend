// import type { Socket } from "socket.io-client";

// type Namespace = 'chat' | 'game:${string}';

// const sockets = new Map<Namespace, Socket>();

// export const getSocket = (namespace: Namespace, opts: ConnectOptions) => {
//     if (!sockets.has(namespace)) {
//         sockets.set(namespace, io(buildUrl(namespace), opts));
//     }
//     return sockets.get(namespace)!;
// }

// export const disconnectSocket = (namespace: Namespace) => {
//     const socket = sockets.get(namespace);
//     if (socket) {
//         socket.disconnect();
//         sockets.delete(namespace);
//     }
// }
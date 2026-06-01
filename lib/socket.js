import { io } from 'socket.io-client';

// Singleton client socket prevents StrictMode dev remount churn.
export const socket = io({
  autoConnect: false,
  path: '/socket.io'
});

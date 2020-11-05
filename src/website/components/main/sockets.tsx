import io from 'socket.io-client';
let SOCKET_URL;

const getSignalingServer = (): void => {
  SOCKET_URL = 'http://localhost:7000';
};

getSignalingServer();

export const socket = io(SOCKET_URL);

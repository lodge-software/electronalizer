import io from 'socket.io-client';
let SOCKET_URL;

const getSignalingServer = (): void => {
  SOCKET_URL = 'http://34.221.196.149:7000';
};

getSignalingServer();

const socket = io(SOCKET_URL);

let socketId: string;

socket.on('connect', () => {
  console.log(`My current socket id is ${socket.id}`);
  socketId = socket.id;
});

socket.on('disconnect', () => {
  console.log(`The socket id: ${socket.id} has disconnected`);
});

export { socket, socketId };

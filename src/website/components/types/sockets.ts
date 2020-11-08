interface Signal {
  origin: string;
  payload: RTCSessionDescription;
  target: string;
  room: string;
}

export { Signal };

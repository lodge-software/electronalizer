interface Signal {
  origin: string;
  payload: RTCSessionDescription;
  target: string;
}

export { Signal };

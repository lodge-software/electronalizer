import React, { useState } from 'react';
import Video from '../media/Video';

const Main = function (): JSX.Element {
  const [stream, setStream] = useState(new MediaStream());
  const [startDisable, setStartDisable] = useState(false);
  const [callDisable, setCallDisable] = useState(true);
  const [hangupDisable, setHangupDisable] = useState(true);

  const start = async () => {
    console.log('Requesting local stream');
    setStartDisable(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      console.log('Received local stream');
      setStream(stream);
      setCallDisable(false);
    } catch (e) {
      alert(`getUserMedia() error: ${e.name}`);
    }
  };

  return (
    <div className="main">
      <Video srcObject={stream} id="localVideo"></Video>
      <video id="remoteVideo" autoPlay></video>
      <button disabled={startDisable} onClick={start}>
        {'Start'}
      </button>
      <button disabled={callDisable}>{'Call'}</button>
      <button disabled={hangupDisable} onClick={() => setHangupDisable(!hangupDisable)}>
        {'Hang Up'}
      </button>
    </div>
  );
};

export default Main;

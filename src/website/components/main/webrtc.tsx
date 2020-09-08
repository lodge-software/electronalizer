import React, { useState } from 'react';
import { Audio } from '../media';

const Main = function (): JSX.Element {
  // const [videoStream, setVideoStream] = useState(new MediaStream());
  const [audioStream, setAudioStream] = useState<MediaStream>(new MediaStream());
  const [startDisable, setStartDisable] = useState(false);
  const [callDisable, setCallDisable] = useState(true);
  const [hangupDisable, setHangupDisable] = useState(true);

  const start = async () => {
    console.log('Requesting local stream');
    setStartDisable(true);
    try {
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log('Received local stream');
      setAudioStream(audioStream);
      setCallDisable(false);
    } catch (e) {
      alert(`getUserMedia() error: ${e.name}`);
    }
  };

  return (
    <div className="main">
      {/* <Video srcObject={stream} id="localVideo"></Video> */}
      <Audio srcObject={audioStream} id="localAudio"></Audio>
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

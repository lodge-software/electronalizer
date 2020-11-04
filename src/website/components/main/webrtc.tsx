import React, { useState } from 'react';
import { Audio } from '../media';
import io from 'socket.io-client';

const Main = function (): JSX.Element {
  // const [videoStream, setVideoStream] = useState(new MediaStream());
  const [audioStream, setAudioStream] = useState<MediaStream>(new MediaStream());
  const [startDisable, setStartDisable] = useState(false);
  const [callDisable, setCallDisable] = useState(true);
  const [hangupDisable, setHangupDisable] = useState(true);

  let local: RTCPeerConnection;

  const offerOptions: RTCOfferOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  };

  const getSignalingServer = (): string => {
    return 'http://localhost:7000';
  };

  let socket: SocketIOClient.Socket;

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

  const call = async () => {
    try {
      setCallDisable(true);
      setHangupDisable(false);
      console.log('Start call');
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
      }

      const configuration = {};
      console.log('RTCPeerConnection configuration:', configuration);
      local = new RTCPeerConnection(configuration);
      const offer = await local.createOffer(offerOptions);
      local.setLocalDescription(offer);
      /* 
      TODO: It makes more sense for socket to exist at top level so we can
      answer calls without having to click call. This implementation will
      only allow you to receive offer if you click call.
      */
      socket = io(getSignalingServer());

      socket.on('connect', () => {
        console.log(`My current socket id is ${socket.id}`);
        // Send offer to remote
        socket.emit('offer', { socket: socket.id, desc: local.localDescription });

        // Listens for any offers from remote -> signaling server -> here
        socket.on('offer', async (currOffer: any) => {
          console.log(`Request for connection received. SocketID is: ${currOffer.socket}`);
          await local.setRemoteDescription(currOffer.desc);
          local.setLocalDescription(await local.createAnswer());
          socket.emit('answer', { socket: socket.id, desc: local.localDescription, dest: currOffer.socket });
        });

        // Listens for answers from remote -> signaling server -> here
        socket.on('answer', async (answer: any) => {
          console.log(`Answer received from remote: ${answer.socket}`);
          await local.setRemoteDescription(answer.desc).catch((e) => console.log(e));
        });
      });
    } catch (e) {
      alert(`error starting call: ${e}`);
    }
  };

  const close = async () => {
    setStartDisable(false);
    setCallDisable(true);
    setHangupDisable(true);
  };

  // const getSelectedSdpSemantics = (): RTCConfiguration => {
  //   return { sdpSemantics: "unified-plan" };
  // };

  return (
    <div className="main">
      {/* <Video srcObject={stream} id="localVideo"></Video> */}
      <Audio srcObject={audioStream} id="localAudio"></Audio>
      {/* <video id="remoteVideo" autoPlay></video> */}
      <button disabled={startDisable} onClick={start}>
        {'Start'}
      </button>
      <button disabled={callDisable} onClick={call}>
        {'Call'}
      </button>
      <button disabled={hangupDisable} onClick={close}>
        {'Hang Up'}
      </button>
    </div>
  );
};

export default Main;

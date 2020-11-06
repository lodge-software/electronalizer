import React, { useEffect, useState } from 'react';
// import { Audio } from '../media';
import { socket } from './sockets';

const Main = function (): JSX.Element {
  // const [videoStream, setVideoStream] = useState(new MediaStream());
  const [localPeerConnection, setLocalPeerConnection] = useState(RTCPeerConnection.prototype);
  // const [audioStream, setAudioStream] = useState<MediaStream>(new MediaStream());
  // const [remoteAudioStream, setRemoteAudioStream] = useState<MediaStream>(new MediaStream());
  const [callDisable, setCallDisable] = useState(false);
  const [hangupDisable, setHangupDisable] = useState(true);

  const offerOptions: RTCOfferOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  };

  const createPeerConnection = () => {
    console.log('Creating peer connection object');
    const peerConnectionConfig = {
      // iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }, { urls: 'stun:stun.l.google.com:19302' }],
    };
    console.log('RTCPeerConnection configuration:', peerConnectionConfig);
    setLocalPeerConnection(new RTCPeerConnection(peerConnectionConfig));
    console.log('Created peer connection object');
  };

  const call = async () => {
    try {
      // setCallDisable(true);
      // setHangupDisable(false);

      console.log('Requesting local stream');
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // setAudioStream(localStream);

      createPeerConnection();

      console.log('Adding tracks');
      localStream.getTracks().forEach((track) => {
        localPeerConnection.addTrack(track, localStream);
      });
      console.log('Added tracks');

      console.log(`Creating offer`);
      const offer = await localPeerConnection.createOffer(offerOptions);
      localPeerConnection.setLocalDescription(offer);
      console.log(`Created offer`);

      console.log(`Emitting offer`);
      socket.emit('offer', { data: offer });
      console.log(`Emitted offer`);

      // localPeerConnection.ontrack = (event: any) => {
      //   setRemoteAudioStream(event.streams[0]);
      // };
    } catch (e) {
      alert(`error starting call: ${e}`);
    }
  };

  const constraints: MediaStreamConstraints = { audio: true, video: false };

  // const retrieveMedia = async (): Promise<MediaStream> => {
  // };

  const hangup = async () => {
    setCallDisable(true);
    setHangupDisable(true);
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log(`My current socket id is ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`The socket id: ${socket.id} has disconnected`);
    });

    socket.on('offer', async (currOffer: any) => {
      console.log(`Request for connection received.`);

      createPeerConnection();
      console.log(localPeerConnection);
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      // setAudioStream(localStream);

      console.log('Adding tracks');
      localStream.getTracks().forEach((track) => {
        localPeerConnection.addTrack(track, localStream);
      });
      console.log('Added tracks');

      await localPeerConnection
        .setRemoteDescription(new RTCSessionDescription(currOffer.data))
        .catch((e) => console.log(e));

      const answer = await localPeerConnection.createAnswer();
      await localPeerConnection.setLocalDescription(answer);
      socket.emit('answer', {
        data: answer,
      });
    });

    socket.on('answer', async (answer: any) => {
      console.log(`Answer received from remote: ${answer.data}`);
      await localPeerConnection
        .setRemoteDescription(new RTCSessionDescription(answer.data))
        .catch((e) => console.log(e));
    });
  }, []);

  return (
    <div className="main">
      {/* <Audio srcObject={audioStream} isAutoPlay={true} id="localAudio"></Audio> */}
      {/* <Audio srcObject={remoteAudioStream} isAutoPlay={true} id="remoteAudio"></Audio> */}
      <button disabled={callDisable} onClick={call}>
        {'Call'}
      </button>
      <button disabled={hangupDisable} onClick={hangup}>
        {'Hang Up'}
      </button>
    </div>
  );
};

export default Main;

import React, { useEffect, useState } from 'react';
import { Audio } from '../media';
import { socket } from './sockets';
import { Signal } from '../types/sockets';

const Main = function (): JSX.Element {
  const [remoteAudioStream, setRemoteAudioStream] = useState<MediaStream | undefined>();
  const [callDisable, setCallDisable] = useState(false);
  const [hangupDisable, setHangupDisable] = useState(true);

  let localPeerConnection: RTCPeerConnection;

  const offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
    voiceActivityDetection: false,
  };

  const handleTrackEvent = (event: any) => {
    console.log(`${JSON.stringify(event)}`);
    console.log(`gotTracks: ${event.streams}`);
    setRemoteAudioStream(event.streams[0]);
    setHangupDisable(false);
  };

  const handleICECandidateEvent = (event: any) => {
    if (event.candidate) {
      console.log(`handleICECandidateEvent: ${event}`);
      socket.emit('new-ice-candidate', {
        // target: targetUsername,
        candidate: event.candidate,
      });
    }
  };

  const createPeerConnection = () => {
    const peerConnectionConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
      ],
    };
    console.log('RTCPeerConnection configuration:', peerConnectionConfig);
    localPeerConnection = new RTCPeerConnection(peerConnectionConfig);
    localPeerConnection.onicecandidate = handleICECandidateEvent;
    localPeerConnection.ontrack = handleTrackEvent;
    return localPeerConnection;
  };

  const call = async () => {
    try {
      setCallDisable(true);
      setHangupDisable(false);

      const localPeerConnection = createPeerConnection();

      console.log('Requesting local stream');
      await configureTracks();

      const offer = await localPeerConnection.createOffer(offerOptions);
      await localPeerConnection.setLocalDescription(offer);
      console.log(`Created offer`);

      socket.on('answer', async (answer: Signal) => {
        console.log(`Answer received from remote: ${answer.payload}`);
        await localPeerConnection.setRemoteDescription(new RTCSessionDescription(answer.payload));
      });

      socket.emit('offer', {
        origin: socket.id,
        payload: offer,
        target: 'temp',
      });
      console.log(`Emitted offer`);
    } catch (e) {
      alert(`error starting call: ${e}`);
    }
  };

  const configureTracks = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);

    const audioTracks = localStream.getTracks();
    if (audioTracks.length > 0) {
      console.log(`Using Audio device: ${audioTracks[0].label}`);
    }
    localStream.getTracks().forEach((t) => localPeerConnection.addTrack(t, localStream));
    console.log('Added local tracks');
  };

  const constraints: MediaStreamConstraints = { audio: true, video: false };

  const hangup = async () => {
    setCallDisable(false);
    setHangupDisable(true);
    // TODO not working:
    // localPeerConnection.ontrack = null;
    // localPeerConnection.onicecandidate = null;
    // if (remoteAudioStream) {
    //   remoteAudioStream.getTracks().forEach((track) => track.stop());
    // }
    // localPeerConnection.close();
  };

  useEffect(() => {
    socket.on('offer', async (offer: Signal) => {
      console.log(`Request for connection received.`);

      localPeerConnection = createPeerConnection();
      console.log('Created peer connection');

      await localPeerConnection.setRemoteDescription(new RTCSessionDescription(offer.payload));

      console.log('Requesting local stream');
      await configureTracks();

      const answer = await localPeerConnection.createAnswer();
      await localPeerConnection.setLocalDescription(answer);
      socket.emit('answer', {
        origin: socket.id,
        payload: answer,
        target: 'temp',
      });
    });

    socket.on('new-ice-candidate', async (payload: any) => {
      console.log(`Received ICE Candidates: ${JSON.stringify(payload)}`);
      const candidate = new RTCIceCandidate(payload.candidate);
      await localPeerConnection.addIceCandidate(candidate);
    });
  }, []);

  return (
    <div className="main">
      <Audio srcObject={remoteAudioStream} isAutoPlay={true} id="remoteAudio"></Audio>
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

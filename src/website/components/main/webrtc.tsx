import React, { useEffect, useState } from 'react';
import { Audio } from '../media';
import { socket } from './sockets';
import { Signal } from '../types/sockets';

const Main = function (): JSX.Element {
  const [remoteAudioStream, setRemoteAudioStream] = useState<MediaStream | undefined>();
  const [callDisable, setCallDisable] = useState(false);
  const [hangupDisable, setHangupDisable] = useState(true);
  const [room, setRoom] = useState('');
  const [remoteId, setRemoteId] = useState('');

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
    if (localPeerConnection) return;
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
    // return localPeerConnection;
  };

  const createRoom = () => {
    setRoom(`room-${socket.id}`);
    console.log(`${room}`);
  };

  const joinRoom = () => {
    socket.emit('join room', { room: room });
    // socket.on('cannot join room', () => {
    //   console.log('Failed to join room');
    // });
  };

  const call = async () => {
    try {
      setCallDisable(true);
      setHangupDisable(false);

      createPeerConnection();

      await configureRTCTracks();
      console.log('Requested local stream');

      const offer = await localPeerConnection.createOffer(offerOptions);
      await localPeerConnection.setLocalDescription(offer);
      console.log(`Created offer`);

      socket.on('answer', async (answer: Signal) => {
        console.log(`Answer received from remote: ${answer.payload}`);
        await localPeerConnection.setRemoteDescription(new RTCSessionDescription(answer.payload));

        // Refactor, also possibly missing ice candidates because race condition?
        socket.on('new-ice-candidate', async (payload: any) => {
          console.log(`Received ICE Candidates: ${JSON.stringify(payload)}`);
          const candidate = new RTCIceCandidate(payload.candidate);
          await localPeerConnection.addIceCandidate(candidate);
        });
      });

      socket.emit('offer', {
        origin: socket.id,
        payload: offer,
        target: remoteId,
        room: room,
      });
      console.log(`Emitted offer`);
    } catch (e) {
      alert(`error starting call: ${e}`);
    }
  };

  // refactor into other component
  const configureRTCTracks = async () => {
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
      if (room != offer.room) {
        // Implement invite
      } else {
        setRoom(offer.room);
      }
      setRemoteId(offer.origin);

      createPeerConnection();
      console.log('Created peer connection');

      await localPeerConnection.setRemoteDescription(new RTCSessionDescription(offer.payload));

      console.log('Requesting local stream');
      await configureRTCTracks();

      const answer = await localPeerConnection.createAnswer();
      await localPeerConnection.setLocalDescription(answer);
      console.log(`room: ${room}`);
      socket.emit('answer', {
        origin: socket.id,
        payload: answer,
        target: remoteId,
        room: offer.room,
      });

      socket.on('new-ice-candidate', async (payload: any) => {
        console.log(`Received ICE Candidates: ${JSON.stringify(payload)}`);
        const candidate = new RTCIceCandidate(payload.candidate);
        await localPeerConnection.addIceCandidate(candidate);
      });
    });

    socket.on('joined room', (payload: any) => {
      console.log(payload.room);
      setRoom(payload.room);
      // socket.off('cannot join room');
    });
  }, []);

  return (
    <div className="main">
      <Audio srcObject={remoteAudioStream} isAutoPlay={true} id="remoteAudio"></Audio>
      <button disabled={callDisable} onClick={createRoom}>
        {'Create room'}
      </button>
      <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} />
      <button disabled={callDisable} onClick={joinRoom}>
        {'Join room'}
      </button>
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

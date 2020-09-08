import React from 'react';
import Video from '../media/Video';

class Main extends React.Component {
  constructor(props: never) {
    super(props);
    this.state = {
      stream: undefined,
      startDisable: false,
      callDisable: true,
      hangupDisable: true,
      srcObject: null,
    };
  }

  state: any;

  start = async () => {
    console.log('Requesting local stream');
    this.setState({ startDisable: true });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      console.log('Received local stream');
      this.setState({ stream: stream, callDisable: false });
    } catch (e) {
      alert(`getUserMedia() error: ${e.name}`);
    }
  };

  render() {
    return (
      <div className="main">
        <Video srcObject={this.state.stream} id="localVideo"></Video>
        <video id="remoteVideo" autoPlay></video>
        <button disabled={this.state.startDisable} onClick={this.start}>
          {'Start'}
        </button>
        <button disabled={this.state.callDisable}>{'Call'}</button>
        <button disabled={this.state.hangupDisable}>{'Hang Up'}</button>
      </div>
    );
  }
}

export default Main;

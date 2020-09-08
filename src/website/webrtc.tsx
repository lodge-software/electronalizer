import React from 'react';

class Main extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      stream: undefined,
      startDisable: false,
      callDisable: true,
      hangupDisable: true,
    };
  }

  state: any;

  start = async () => {
    console.log('Requesting local stream');
    this.setState({startDisable: true});
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
      console.log('Received local stream');
      this.setState({stream: stream, callDisable: false});
    } catch (e) {
      alert(`getUserMedia() error: ${e.name}`);
    }
  };

  render() {
    return (
      <div className="main">
        <video src={this.state.stream} id="localVideo" autoPlay muted></video>
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

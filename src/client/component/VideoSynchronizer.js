import React, { Component } from 'react';
import YPlayer from './YPlayer';
import './videosynchronizer.css';

export default class VideoSynchronizer extends Component {
    constructor(props) {
      super(props);
  
      this.cvRef = React.createRef();
  
    //   this.state.analyser = this.state.audioCtx.createAnalyser();
    //   this.state.analyser.fftSize = 2048;
  
      this.drawSineWave = this.drawSineWave.bind(this);
    }
  
    componentDidMount() {
        // let arrayBuffer = this.props.buffer.buffer, that = this;

        // this.state.audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
                // let source = that.state.audioCtx.createBufferSource();
                // source.buffer = buffer;
                // source.playbackRate.value = 1;
                // source.connect(that.state.audioCtx.destination);
                // source.connect(that.state.analyser);
                // source.loop = false;

                // that.setState({
                //     channelData : buffer.getChannelData(0),
                //     length:buffer.length,
                    // duration:buffer.duration,
                    // source:source,
                    // sampleRate:buffer.sampleRate
                // });

                // that.state.source.start(0);
                
        //         that.drawSineWave();
        //     },
        //     function(e){"Error with decoding audio data" + e.error}
        // );
        this.drawSineWave();
    }
  
    drawSineWave() {
      const sinewaveСanvasCtx = this.cvRef.current.getContext("2d"),
        width = this.cvRef.current.offsetWidth, height = this.cvRef.current.offsetHeight, 
        middle = height / 2;;
  
      sinewaveСanvasCtx.clearRect(0, 0, width, height);
  
      requestAnimationFrame(this.drawSineWave);
  
      sinewaveСanvasCtx.fillStyle = 'rgb(0, 0, 0)';
  
      let x = 0;
      let waveScale = 2;
  
      for (let i = 0; i < width; i += 1) {
        x = parseInt(i/width*this.props.audioInfo.length);
        const item = this.props.audioInfo.channelData[x] || 0;
  
        sinewaveСanvasCtx.beginPath();
        sinewaveСanvasCtx.moveTo(i, middle);
        sinewaveСanvasCtx.lineTo(i, middle + (waveScale*item*middle));
        sinewaveСanvasCtx.moveTo(i, middle);
        sinewaveСanvasCtx.lineTo(i, middle - (waveScale*item*middle));
        sinewaveСanvasCtx.strokeStyle = "red";
        sinewaveСanvasCtx.stroke();
      }
    }
  
    render() {
      return (
        <>
          <canvas className="Sinewave" ref={this.cvRef} width="1024" height="100"></canvas>
        </>
      );
    }
  }
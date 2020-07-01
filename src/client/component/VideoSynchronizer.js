import React, { Component } from 'react';
import YPlayer from './YPlayer';
import './videosynchronizer.css';

export default class VideoSynchronizer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            x : 0,
            clickX : null,
            isPlaying : false,
            time : null,
            audioCtx : null
        }
  
        this.cvRef = React.createRef();
        
        this.handleOnMouseMove = this.handleOnMouseMove.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);

        this.drawSineWave = this.drawSineWave.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.getChannelOffsetX = this.getChannelOffsetX.bind(this);
        this.getDurationOffsetX = this.getDurationOffsetX.bind(this);
    }
  
    componentDidMount() {
        this.drawSineWave();
    }

    handleOnMouseMove(e) {
        this.setState({x:e.clientX - this.cvRef.current.offsetLeft});
        this.playAudio(e, 0.05);
    }

    handleOnClick(e) {
        this.playAudio(e, 1);
    }

    getChannelOffsetX(percentage) {
        const st = this.props.st, et = this.props.et;
        const etChannelOffset = et / this.props.buffer.duration * this.props.buffer.length;
        const stChannelOffset = st / this.props.buffer.duration * this.props.buffer.length;
        const iChannelOffset = percentage * this.props.buffer.length;

        const adjustedOffset = stChannelOffset + (percentage*(etChannelOffset-stChannelOffset))

        try{
            if (adjustedOffset > this.props.buffer.length) {
                throw new Error(`percentage(${percentage}) : ${adjustedOffset}/${this.props.buffer.length}`);
            }
        } catch(e) {
            console.log(e.stack);
        }

        return Math.round(adjustedOffset);
    }

    getDurationOffsetX(percentage) {
        const st = this.props.st, et = this.props.et;
        const duration = et - st;

        return parseFloat(parseFloat(st) + parseFloat(percentage * duration)).toFixed(2);
    }

    playAudio(e, wantedDuration) {
        const x = e.clientX - this.cvRef.current.offsetLeft;
        const width = this.cvRef.current.offsetWidth;

        const durationX = this.getDurationOffsetX(x/width);

        const audioCtx = new window.AudioContext();
        let source = audioCtx.createBufferSource();

        source.buffer = this.props.buffer;
        source.playbackRate.value = 1;
        source.connect(audioCtx.destination);
        source.loop = false;

        source.start(0, durationX, wantedDuration);
        source.stop(wantedDuration);

        this.setState({
            audioCtx : audioCtx,
            clickX : x, 
            isPlaying:true,
            time:audioCtx.currentTime
        });

        const that = this;

        const timer = setTimeout(()=>{
            that.setState({audioCtx : null, clickX : x, isPlaying : false, time:null});
            audioCtx.close();
        }, wantedDuration*1000);
    }
  
    drawSineWave() {
        requestAnimationFrame(this.drawSineWave);

        if (this.props.buffer !== null) {
            const sinewaveСanvasCtx = this.cvRef.current.getContext("2d"),
                width = this.cvRef.current.offsetWidth, height = this.cvRef.current.offsetHeight, 
                middle = height / 2;;
        
            // draw bg
            sinewaveСanvasCtx.clearRect(0, 0, width, height);
            sinewaveСanvasCtx.fillStyle='rgb(125, 125, 125)';
            sinewaveСanvasCtx.fillRect(0, 0, width, height);
        
            let x = 0;
            let waveScale = 3;

            sinewaveСanvasCtx.strokeStyle = "rgb(220, 220, 220)";
            // draw sinewave
            for (let i = 0; i < width; i += 1) {
                const x = this.getChannelOffsetX(i/width);
                const item = this.props.buffer.getChannelData(0)[x] || 0;
        
                sinewaveСanvasCtx.beginPath();
                sinewaveСanvasCtx.moveTo(i, middle + (waveScale*item*middle));
                sinewaveСanvasCtx.lineTo(i, middle - (waveScale*item*middle));
                sinewaveСanvasCtx.stroke();
            }

            // draw mouse line
            sinewaveСanvasCtx.beginPath();
            sinewaveСanvasCtx.moveTo(this.state.x, 0);
            sinewaveСanvasCtx.lineTo(this.state.x, height);
            sinewaveСanvasCtx.strokeStyle = "rgb(255, 0, 0)";
            sinewaveСanvasCtx.stroke();


            sinewaveСanvasCtx.strokeStyle = "rgb(0, 255, 0)";
            // draw playing line
            if (this.state.clickX !== null) {
                sinewaveСanvasCtx.beginPath();
                if (this.state.isPlaying) {
                    const timeDiff = (this.state.audioCtx.currentTime - this.state.time);
                    let offsetX = timeDiff/(this.props.et - this.props.st);
                    offsetX = offsetX*this.cvRef.current.offsetWidth;
                    sinewaveСanvasCtx.moveTo(this.state.clickX + offsetX, 0);
                    sinewaveСanvasCtx.lineTo(this.state.clickX + offsetX, height);
                } else {
                    sinewaveСanvasCtx.moveTo(this.state.clickX, 0);
                    sinewaveСanvasCtx.lineTo(this.state.clickX, height);
                }
                sinewaveСanvasCtx.stroke();
            }

            // draw timeline
            sinewaveСanvasCtx.font = '14px serif';
            const duration = this.props.et - this.props.st;

            sinewaveСanvasCtx.strokeStyle="rgb(0,0,0)";
            sinewaveСanvasCtx.fillStyle="rgb(0,0,0)";

            for (let i=0; i <= width; i += width/10) {
                let percentage = i/width;
                sinewaveСanvasCtx.fillText(`${parseFloat(duration*percentage+parseFloat(this.props.st)).toFixed(1)}`, i, 15);
            }
        }
    }
  
    render() {
      return (
        <div className="VideoSynchronizer">
          <canvas className="VideoSync" ref={this.cvRef}  width="1324" height="100"
            onMouseMove={this.handleOnMouseMove}
            onClick={this.handleOnClick}></canvas>
        </div>
      );
    }
  }
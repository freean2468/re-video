import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import YouTube from 'react-youtube';
import './yplayer.css';
import TextCanvas from './TextCanvas'

{/* <YouTube
  videoId={string}                  // defaults -> null
  id={string}                       // defaults -> null
  className={string}                // defaults -> null
  containerClassName={string}       // defaults -> ''
  opts={obj}                        // defaults -> {}
  onReady={func}                    // defaults -> noop
  onPlay={func}                     // defaults -> noop
  onPause={func}                    // defaults -> noop
  onEnd={func}                      // defaults -> noop
  onError={func}                    // defaults -> noop
  onStateChange={func}              // defaults -> noop
  onPlaybackRateChange={func}       // defaults -> noop
  onPlaybackQualityChange={func}    // defaults -> noop
/> */}
 
export default class YPlayer extends Component {
  constructor(props) {
    super(props)

    this.textDisplayRef = React.createRef();

    this.seekTo = this.seekTo.bind(this);

    this.state = {
      player : null
    }

    this.handleOnReady = this.handleOnReady.bind(this);
    this.handleOnStateChange = this.handleOnStateChange.bind(this);

    this.textDisplayContainerEl = document.createElement("div");
    this.textDisplayContainerEl.setAttribute('class', 'TextCanvasContainer');
  }

  componentDidMount = () => {
    if(this.props.flag) {
        const container = document.getElementsByClassName(this.props.container)[this.props.idx*2];
        container.appendChild(this.textDisplayContainerEl);
    }
  };
  
  componentWillUnmount = () => {
    if(this.props.flag) {
        const container = document.getElementsByClassName(this.props.container)[this.props.idx*2];
        container.removeChild(this.textDisplayContainerEl);
    }
  };

  seekTo(seconds) {
    this.state.player.seekTo(seconds);
  }

  handleOnStateChange(event) {
    switch(event.data){
        case YT.PlayerState.CUED:
            break;
        case YT.PlayerState.PAUSED:
            break;
        case YT.PlayerState.ENDED:
            break;
        case YT.PlayerState.PLAYING:
            event.target.pauseVideo();
            break;
        case YT.PlayerState.BUFFERING:
            break;
    }
  }
 
  handleOnReady(event) {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
    this.setState({player:event.target});
    event.target.seekTo(parseInt(this.props.time));
  }

  render() {
    const opts = {
      height: '1080',
      width: '1920',
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        // origin: 'http://localhost:'+configs.port,
        rel: 0,
        fs:0,
        controls:0
      },
    };

    return (
      <>
        <YouTube containerClassName={this.props.container} 
          className={this.props.class} 
          videoId={this.props.link} 
          opts={opts}
          onStateChange={this.handleOnStateChange}
          onReady={this.handleOnReady}
        />
        {this.props.flag &&
            ReactDOM.createPortal(
                  <TextCanvas ref={this.textDisplayRef} 
                    cv={this.props.cv} 
                    t={this.props.t}
                    idx={this.props.idx}
                    source={this.props.source}
                    updateCanvasInfo={this.props.updateCanvasInfo}
                  />,
                this.textDisplayContainerEl)
        }
      </>
    );
  }
}
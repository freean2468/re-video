import React, { Component } from "react";
import VideoInfo from "./VideoInfo";

/*
  Main > VideoInfo > ScreenCut > TextInfo > StcToken > WdToken
*/

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {videoInfo : props.videoInfo}
    this.videoInfoRef = React.createRef();
  }

  updateVideoInfo(info) {
    this.setState({videoInfo:info})
    this.videoInfoRef.current.updateVideoInfo(info)
  }

  render() {
    return (
      <div className="Main">
        <VideoInfo videoInfo={this.state.videoInfo} ref={this.videoInfoRef}/>
      </div>
    );
  }
}

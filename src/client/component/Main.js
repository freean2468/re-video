import React, { Component } from "react";
import VideoInfo from "./VideoInfo";

/*
  Main > VideoInfo > ScreenCut > TextInfo > StcToken > WdToken
*/

export default class Main extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="Main">
        <VideoInfo videoInfo={this.props.videoInfo}/>
      </div>
    );
  }
}

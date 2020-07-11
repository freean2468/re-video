import React from "react";
import VideoInfo from "./VideoInfo";
import './main.css';

/*
  Main > VideoInfo > ScreenCut > TextInfo > StcToken > WdToken
*/

export default function Main(props) {
  return (
    <div className="Main">
      <VideoInfo metadata={props.metadata}/>
    </div>
  );
}

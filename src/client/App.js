import React, { Component } from 'react';
import './app.css';
import Nav from './component/Nav'
import Main from './component/Main'

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      videoInfo : null
    }

    this.loadVideo = this.loadVideo.bind(this);
  }

  loadVideo(name, json) {
    let item = json;
    item['_id'] = name;
    this.setState({ videoInfo:item });
  }

  componentDidMount() {
    document.title = 'Re-video';
  }

  render() {
    return (
      <div className="Wrapper">
        <Nav loadVideo={this.loadVideo}/>
        {this.state.videoInfo !== null && 
          <Main videoInfo={this.state.videoInfo}/>
        }
      </div>
    );
  }
}

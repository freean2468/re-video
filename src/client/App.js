import React, { Component } from 'react';
import './app.css';
import Nav from './component/Nav'
import Main from './component/Main'

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      folder : null,
      videoInfo : null
    }

    this.loadVideoData = this.loadVideoData.bind(this);
  }

  loadVideoData(name, folder, json) {
    let item = json;
    item['_id'] = name;
    this.setState({ folder: folder, videoInfo:item });
  }

  componentDidMount() {
    document.title = 'Re-video';
  }

  render() {
    return (
      <div className="Wrapper">
        <Nav loadVideoData={this.loadVideoData}/>
        {this.state.videoInfo !== null && 
          <Main folder={this.state.folder} videoInfo={this.state.videoInfo}/>
        }
      </div>
    );
  }
}

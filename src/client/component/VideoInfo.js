import React, { Component } from 'react';
import SceneCut from './SceneCut';

export default class VideoInfo extends Component {
    /*
      source, link, c[]
    */
    constructor(props) {
      super(props)
      this.state = {
        videoInfo : props.videoInfo,
        sourceList : []
      };
      this.handleChange = this.handleChange.bind(this)
      this.handleClickInsert = this.handleClickInsert.bind(this)
      this.updateSceneCut = this.updateSceneCut.bind(this)


      fetch('/api/getSourceList')
        .then(res => res.json())
        .then(res => this.setState({sourceList:res.source}))
    }
  
    // refed
    updateVideoInfo(info) {
      this.setState({videoInfo : info});
    }
  
    handleChange(key, value) {
      let item = this.state.videoInfo
      item[key] = value
      this.setState({videoInfo : item})
    }
  
    handleClickInsert() {
      fetch('/api/insert', {
          method: 'POST',
          body: JSON.stringify(this.state.videoInfo),
          headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(res => console.log('[INSERT RES] ',res.res))
    }
  
    // called from bottom
    updateSceneCut(cut, idx) {
      //  shallow copy
      let item = this.state.videoInfo['c'];
      item[idx] = cut;
      this.handleChange('c', item)
    }
  
    render() {
      return (
        <div className="VideoInfo">
          <span>
            _id :
            <input
              type="text"
              value={this.state.videoInfo['_id']}
              onChange={(e) => this.handleChange('name', e.target.value)}
            />
          </span>
          <span>
            link :
            <input
              type="text"
              value={this.state.videoInfo['link']}
              onChange={(e) => this.handleChange('link', e.target.value)}
            />
          </span>
          <span>
            source :
            <select value={this.state.videoInfo['source']} onChange={(e) => this.handleChange('source', e.target.value)}>
              {this.state.sourceList !== [] &&
                this.state.sourceList.map((item, idx) => <option key={idx} value={idx}>{item}</option>)}
            </select>
          </span>
          <div>
            {this.state.videoInfo['c'] &&
              this.state.videoInfo['c'].map((cut, idx) => 
                <SceneCut 
                  key={idx} 
                  cut={cut}
                  idx={idx}
                  updateSceneCut={this.updateSceneCut}
                  link={this.state.videoInfo.link}
                  source={this.state.videoInfo.source}
                />)
            }
          </div>
          <div>
            <button
              onClick={this.handleClickInsert}
            >Insert</button>
          </div>
          <div>
            <div className="DisplayVideoInfo">
                <pre>{JSON.stringify(this.state.videoInfo, null, 2) }</pre>
            </div>
          </div>
        </div>
      );
    }
}
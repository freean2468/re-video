import React, { Component } from 'react';
import SceneCut from './SceneCut';
import './videoinfo.css';

export default class VideoInfo extends Component {
    /*
      source, link, c[]
    */
    constructor(props) {
      super(props)

      this.handleChange = this.handleChange.bind(this);
      this.handleClickInsert = this.handleClickInsert.bind(this);
      this.handleOnChangeFile = this.handleOnChangeFile.bind(this);

      this.updateCvTypeList = this.updateCvTypeList.bind(this);
      this.updateSceneCut = this.updateSceneCut.bind(this);
    }

    handleChange(key, value) {
      let item = this.props.videoInfo
      item[key] = value
      this.setState({videoInfo : item})
    }
  
    handleClickInsert() {
      fetch(`/api/insert?folder=${this.props.folder}`, {
          method: 'POST',
          body: JSON.stringify(this.props.videoInfo),
          headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(res => console.log('[INSERT RES] ',res.res))
    }

    handleOnChangeFile(e) {
      let fullName = event.target.files[0].name;
      let idx = fullName.lastIndexOf('.');

      this.handleChange('file', fullName.substring(0, idx));
      this.loadAudio();
    }
  
    // called from bottom
    updateSceneCut(cut, idx) {
      //  shallow copy
      let item = this.props.videoInfo['c'];
      item[idx] = cut;
      this.handleChange('c', item)
    }

    updateCvTypeList(array) {
      this.setState({cvTypeList:array});
    }
  
    render() {
      return (
        <div className="VideoInfo">
          <span className="MarginRight">
            link :
            <input
              type="text"
              value={this.props.videoInfo.link}
              onChange={(e) => this.handleChange('link', e.target.value)}
            />
          </span>
          <span className="MarginRight">
            source :
            <select value={this.props.videoInfo['source']} onChange={(e) => this.handleChange('source', e.target.value)}>
              {this.state.sourceList !== [] &&
                this.state.sourceList.map((item, idx) => <option key={idx} value={idx}>{item}</option>)}
            </select>
          </span>
          <span className="MarginRight">
            file : '{this.props.videoInfo.file}'
            <input type="file"
                onChange={this.handleOnChangeFile}
            ></input>
          </span>
          <div>
            {this.props.videoInfo['c'] &&
              this.props.videoInfo['c'].map((cut, idx) => 
                <SceneCut
                  key={idx} 
                  cut={cut}
                  idx={idx}
                  updateSceneCut={this.updateSceneCut}
                  insert={this.handleClickInsert}
                  buffer={this.state.audioBuffer}
                  videoInfo={this.props.videoInfo}
                  cvTypeList={this.state.cvTypeList}
                  updateCvTypeList={this.updateCvTypeList}
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
                <pre>{JSON.stringify(this.props.videoInfo, null, 2) }</pre>
            </div>
          </div>
        </div>
      );
    }
}
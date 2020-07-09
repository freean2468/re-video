import React, { Component } from 'react';
import SceneCut from './SceneCut';
import './videoinfo.css';

export default class VideoInfo extends Component {
    /*
      source, link, c[]
    */
    constructor(props) {
      super(props)
      this.state = {
        sourceList : [],
        audioBuffer : null
      };

      this.init = this.init.bind(this);

      this.loadAudio = this.loadAudio.bind(this);

      this.handleChange = this.handleChange.bind(this);
      this.handleClickInsert = this.handleClickInsert.bind(this);
      this.updateSceneCut = this.updateSceneCut.bind(this);
      this.handleOnChangeFile = this.handleOnChangeFile.bind(this);
    }

    init() {
      this.loadAudio();
    }

    componentDidMount() {
      fetch('/api/getSourceList')
      .then(res => res.json())
      .then(res => this.setState({sourceList:res.source}));

      this.init();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
      // console.log('prevProps : (' + prevProps.videoInfo.file + ') props : (' + this.props.videoInfo.file + ')');
      if (this.props.videoInfo.file !== prevProps.videoInfo.file) {
        this.init();
      }
    }

    loadAudio() {
      if (this.props.videoInfo.file !== undefined && this.props.videoInfo.file !== '') {
        const that = this;
        fetch(`/api/getAudio?source=${this.props.videoInfo.source}&name=${encodeURIComponent(this.props.videoInfo.file)}`)
        .then(res => {
          const reader = res.body.getReader();
          let buffer = new Uint8Array(0);

          function read(reader) {
            return reader.read().then(({ done, value }) => {
              if (done) {
                  const arrayBuffer = buffer.buffer,
                  audioCtx = new(window.AudioContext || window.webkitAudioContext)();

                  audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
                      that.setState({ audioBuffer : buffer });
                    },
                    function (e) {
                      "Error with decoding audio data" + e.error
                    }
                  );
                  return null;
              }

              function concatTypedArrays(a, b) { // a, b TypedArray of same type
                var c = new (a.constructor)(a.length + b.length);
                c.set(a, 0);
                c.set(b, a.length);
                return c;
              }
              buffer = concatTypedArrays(buffer, value);

              return read(reader);
            });
          };

          return read(reader);
        });
      } else {
        this.setState({ audioBuffer:null });
      }
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
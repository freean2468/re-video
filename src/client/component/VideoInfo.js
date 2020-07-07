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
        isDisabled : true,
        sourceList : [],
        audioBuffer : null
      };

      this.loadAudio = this.loadAudio.bind(this);

      this.handleChange = this.handleChange.bind(this);
      this.handleClickInsert = this.handleClickInsert.bind(this);
      this.updateSceneCut = this.updateSceneCut.bind(this);
      this.handleClickToggler = this.handleClickToggler.bind(this);
      this.handleOnChangeFile = this.handleOnChangeFile.bind(this);
    }

    componentDidMount() {
      fetch('/api/getSourceList')
      .then(res => res.json())
      .then(res => this.setState({sourceList:res.source}));

      this.loadAudio();
    }

    componentDidUpdate(prevProps) {
      console.log('videoInfo did update');
      if (this.props.videoInfo.file !== prevProps.videoInfo.file) {
        if (this.props.videoInfo.file !== undefined || this.props.videoInfo.file !== '') {
          fetch('/api/getSourceList')
          .then(res => res.json())
          .then(res => this.setState({sourceList:res.source}));
    
          this.loadAudio();
        } else {
          this.setState({ audioBuffer:null });
        }
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
                    // console.log('audio load ended ');
                    initAudioData(buffer);
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

            function initAudioData(buffer) {
              const arrayBuffer = buffer.buffer,
                    audioCtx = new(window.AudioContext || window.webkitAudioContext)();

              audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
                  console.log('loading auidobuffer completed!')
                  that.setState({ audioBuffer : buffer });
                },
                function (e) {
                  "Error with decoding audio data" + e.error
                }
              );
            }

            return read(reader);
          });
      }
    }
  
    handleChange(key, value) {
      let item = this.props.videoInfo
      item[key] = value
      this.setState({videoInfo : item})
    }
  
    handleClickInsert() {
      fetch('/api/insert', {
          method: 'POST',
          body: JSON.stringify(this.props.videoInfo),
          headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(res => console.log('[INSERT RES] ',res.res))
    }

    handleClickToggler() {
      let isDisabled = this.state.isDisabled;

      this.setState({isDisabled:!this.state.isDisabled});

      if (isDisabled) {
        fetch(`/api/deleteVideo?id=${this.props.videoInfo._id}`)
          .then(res => res.json())
          .then(res => console.log('[deleteVideo_RES] : ', res))
      } else {
        this.handleClickInsert();
      }
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
            _id (link) :
            <input
              type="text"
              value={this.props.videoInfo['_id']}
              onChange={(e) => this.handleChange('_id', e.target.value)}
              disabled={(this.state.isDisabled)? "disabled" : ""}
            />
            <button
              className="Toggler"
              onClick={this.handleClickToggler}
            >Toggler</button>
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
                  link={this.props.videoInfo._id}
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
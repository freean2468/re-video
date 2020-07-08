import React, { Component, PureComponent } from 'react';
import TextInfo from './TextInfo';
import './textcanvas.css';
import TextCanvas from './TextCanvas'

class SnapshotImg extends Component {
  constructor(props) {
    super(props);

    this.state = {
      t : props.t,
      buffer : null,
      fileName : props.videoInfo.file
    }
  }

  componentDidMount() {
    if (this.state.fileName !== undefined && this.state.fileName !== '' && this.state.t >= 0) {
      const that = this;
      fetch(`/api/getSnapshot?source=${this.props.videoInfo.source}
            &name=${encodeURIComponent(this.props.videoInfo.file)}&t=${this.props.t}
            &size=${this.props.width}x${this.props.height}`)
        .then(res => res.blob())
        .then(res => {
          let arrayBuffer = null;
          const fileReader = new FileReader();

          fileReader.onload = function(event) {
            arrayBuffer = event.target.result;
            let src = new Blob([new Uint8Array(arrayBuffer)], {type:"image/jpeg"});

            that.setState({buffer : window.URL.createObjectURL(src)});
          };
          fileReader.readAsArrayBuffer(res);
        });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const that = this;
    // console.log('prevProps : (' + prevProps.videoInfo.file + ') prevState : (' + prevState.fileName + ')');

    if (prevProps.videoInfo.file !== prevState.fileName) {
      if (prevProps.videoInfo.file === '') {
        this.setState({
          fileName : prevProps.videoInfo.file,
          buffer : null
        })
      } else {
        fetch(`/api/getSnapshot?source=${prevProps.videoInfo.source}
              &name=${encodeURIComponent(prevProps.videoInfo.file)}&t=${prevProps.t}
              &size=${prevProps.width}x${prevProps.height}`)
        .then(res => res.blob())
        .then(res => {
          let arrayBuffer = null;
          const fileReader = new FileReader();

          fileReader.onload = function(event) {
            arrayBuffer = event.target.result;
            let src = new Blob([new Uint8Array(arrayBuffer)], {type:"image/jpeg"});

            that.setState({
              t : prevProps.t,
              buffer : window.URL.createObjectURL(src),
              fileName : prevProps.videoInfo.file
            })
          };
          fileReader.readAsArrayBuffer(res);
        });
      }
    }
  }

  render() {
    return (
      this.state.buffer &&
      <img src={this.state.buffer} type="image/jpeg"/>
    );
  }
}

export default class SceneCut extends Component {
    /*
      st, et, t{}, lt, pp, cv
    */
    constructor(props) {
      super(props);

      this.state = {
        width : 768,
        height : null
      }

      this.state.height = this.state.width*9/16;

      this.handleChangeSt = this.handleChangeSt.bind(this);
      this.handleChangeEt = this.handleChangeEt.bind(this);
      this.handleChange = this.handleChange.bind(this);

      this.updateTextInfo = this.updateTextInfo.bind(this);
      this.updateCanvasInfo = this.updateCanvasInfo.bind(this);
  
      this.insert = props.insert.bind(this);
      this.updateSceneCut = props.updateSceneCut.bind(this);
    }

    handleChangeSt(value){
      if (parseInt(value) >= 0) {
        this.getSnapshot('st', value);
      }
      this.handleChange('st', value);
    }

    handleChangeEt(value){
      if (parseInt(value) >= 0) {
        this.getSnapshot('et', value);
      }
      this.handleChange('et', value);
    }
  
    handleChange(key, value){
      let item = this.props.cut;
      // computed property
      item[key] = value;
  
      this.updateSceneCut(item, this.props.idx)
    }
  
    /**********
    // called by bottom
    ***********/
    updateTextInfo(key, value){
      let item = this.props.cut.t;
      item[key] = value[key]
      this.handleChange('t', item)
    }

    updateCanvasInfo(key, value) {
      let item = this.props.cut.cv;
      if (item === undefined) {
        item = {}
      }
      item[key] = value;
      this.handleChange('cv', item);
    }
  
    render() {
      let st = 'st', et = 'et', lt = 'lt', pp = 'pp'

      return (
        <div className="SceneCut">
          <div>
            {st} : 
            <input
              type='text'
              value={this.props.cut[st]}
              onChange={(e) => this.handleChangeSt(e.target.value)}
            />
          </div>
          <div className="TextCanvasContainer">
            <SnapshotImg t={this.props.cut.st} videoInfo={this.props.videoInfo}
                        width={this.state.width} height={this.state.height}
            />
            {this.props.cut.cv &&
              <TextCanvas cv={this.props.cut['cv']} 
                t={this.props.cut.t}
                idx={this.props.idx}
                source={this.props.source}
                updateCanvasInfo={this.updateCanvasInfo}
                width={this.state.width}
                height={this.state.height}
              />
            }
          </div>
          <div>
            {et} : 
            <input
              type='text'
              value={this.props.cut[et]}
              onChange={(e) => this.handleChangeEt(e.target.value)}
            />
          </div>
          <SnapshotImg t={this.props.cut.et} videoInfo={this.props.videoInfo}
                      width={this.state.width} height={this.state.height}
          />
          <TextInfo 
            c={this.props.idx}
            t={this.props.cut['t']} 
            insert={this.insert}
            updateTextInfo={this.updateTextInfo}
            link={this.props.link}
            st={this.props.cut.st}
            et={this.props.cut.et}
            buffer={this.props.buffer}
            videoInfo={this.props.videoInfo}
          />
          <div>
            {lt} : 
            <textarea
              value={this.props.cut[lt]}
              onChange={(e) => this.handleChange(lt, e.target.value)}
            />
          </div>
          <div>
            {pp} : 
            <textarea
              value={this.props.cut[pp]}
              onChange={(e) => this.handleChange(pp, e.target.value)}
            />
          </div>
        </div>
      );
    }
}
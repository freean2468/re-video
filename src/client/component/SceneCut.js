import React, { Component } from 'react';
import TextInfo from './TextInfo';
import './textcanvas.css';
import TextCanvas from './TextCanvas'

export default class SceneCut extends Component {
    /*
      st, et, t{}, lt, pp, cv
    */
    constructor(props) {
      super(props);

      this.state = {
        stSnapshot : null,
        etSnapshot : null,
        imgWidth : 768,
        imgHeight : null
      }

      this.state.imgHeight = 768*9/16;

      this.handleChangeSt = this.handleChangeSt.bind(this);
      this.handleChangeEt = this.handleChangeEt.bind(this);
      this.handleChange = this.handleChange.bind(this);

      this.getSnapshot = this.getSnapshot.bind(this);
      this.updateTextInfo = this.updateTextInfo.bind(this);
      this.updateCanvasInfo = this.updateCanvasInfo.bind(this);
  
      this.insert = props.insert.bind(this);
      this.updateSceneCut = props.updateSceneCut.bind(this);

      this.getSnapshot('st', props.cut.st);
      this.getSnapshot('et', props.cut.et)
    }

    handleChangeSt(value){
      this.getSnapshot('st', value);
      this.handleChange('st', value);
    }

    handleChangeEt(value){
      this.getSnapshot('et', value);
      this.handleChange('et', value);
    }
  
    handleChange(key, value){
      let item = this.props.cut;
      // computed property
      item[key] = value;
  
      this.updateSceneCut(item, this.props.idx)
    }

    getSnapshot(which, t) {
      if (t !== undefined) {
        const that = this;
        fetch(`/api/getSnapshot?source=${this.props.videoInfo.source}
              &name=${encodeURIComponent(this.props.videoInfo.file)}&t=${t}
              &size=${this.state.imgWidth}x${this.state.imgHeight}`)
          .then(res => res.blob())
          .then(res => {
            // console.log(res);
            let arrayBuffer = null;
            const fileReader = new FileReader();

            fileReader.onload = function(event) {
              arrayBuffer = event.target.result;
              // console.log(arrayBuffer);

              function toBuffer(ab) {
                var buf = Buffer.alloc(ab.byteLength);
                var view = new Uint8Array(ab);
                for (var i = 0; i < buf.length; ++i) {
                    buf[i] = view[i];
                }
                return buf;
              }

              let buffer = toBuffer(arrayBuffer);

              if (which === 'st') {
                that.setState({stSnapshot:buffer});
              } else {
                that.setState({etSnapshot:buffer});
              }
            };
            fileReader.readAsArrayBuffer(res);
          });
      }
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

      function toArrayBuffer(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
      }

      let stSrc = null;
      if (this.state.stSnapshot !== null) {
        let data = this.state.stSnapshot;
        
        let arrayBuffer = toArrayBuffer(data);
        stSrc = new Blob([arrayBuffer], {type:"image/jpeg"});
      }

      let etSrc = null;
      if (this.state.etSnapshot !== null) {
        let data = this.state.etSnapshot;
        
        let arrayBuffer = toArrayBuffer(data);
        etSrc = new Blob([arrayBuffer], {type:"image/jpeg"});
      }

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
          {stSrc !== null &&
            <div className="TextCanvasContainer">
              <img src={window.URL.createObjectURL(stSrc)} type="image/jpeg">
              </img>
              <TextCanvas cv={this.props.cut['cv']} 
                t={this.props.cut.t}
                idx={this.props.idx}
                source={this.props.source}
                updateCanvasInfo={this.updateCanvasInfo}
                width={this.state.imgWidth}
                height={this.state.imgHeight}
              />
            </div>
          }
          <div>
            {et} : 
            <input
              type='text'
              value={this.props.cut[et]}
              onChange={(e) => this.handleChangeEt(e.target.value)}
            />
          </div>
          {etSrc !== null &&
            <img src={window.URL.createObjectURL(etSrc)} type="image/jpeg"/>
          }
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
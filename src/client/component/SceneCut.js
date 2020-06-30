import React, { Component } from 'react';
import TextInfo from './TextInfo';
import YPlayer from './YPlayer';

export default class SceneCut extends Component {
    /*
      st, et, t{}, lt, pp, cv
    */
    constructor(props) {
      super(props)

      this.handleChangeSt = this.handleChangeSt.bind(this);
      this.handleChangeEt = this.handleChangeEt.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.updateTextInfo = this.updateTextInfo.bind(this);
      this.updateCanvasInfo = this.updateCanvasInfo.bind(this);
  
      this.insert = props.insert.bind(this);
      this.updateSceneCut = props.updateSceneCut.bind(this);

      this.ypStRef = React.createRef();
      this.ypEtRef = React.createRef();
    }

    handleChangeSt(value){
      this.ypStRef.current.seekTo(value);
      this.handleChange('st', value);
    }

    handleChangeEt(value){
      this.ypEtRef.current.seekTo(value);
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
          <YPlayer ref={this.ypStRef} time={this.props.cut[st]} idx={this.props.idx} t={this.props.cut.t}
            flag={true} link={this.props.link} source={this.props.source}
            container="iframe-container"  class="iframe" 
            cv={this.props.cut['cv']}
            updateCanvasInfo={this.updateCanvasInfo}
          />
          <div>
            {et} : 
            <input
              type='text'
              value={this.props.cut[et]}
              onChange={(e) => this.handleChangeEt(e.target.value)}
            />
          </div>
          <YPlayer ref={this.ypEtRef} time={this.props.cut[et]} idx={this.props.idx} 
            flag={false} link={this.props.link} container="iframe-container"  class="iframe" 
          />
          <TextInfo 
            c={this.props.idx}
            t={this.props.cut['t']} 
            insert={this.insert}
            updateTextInfo={this.updateTextInfo}
            link={this.props.link}
            st={this.props.cut.st}
            et={this.props.cut.et}
            audioInfo={this.props.audioInfo}
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
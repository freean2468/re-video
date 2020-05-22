import React, { Component } from "react";

/*
  Main > VideoInfo > ScreenCut > TextInfo > StcToken > WdToken, PctToken
*/

class PctToken extends Component {
  /*
    ct, lt, pp
  */
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)

    this.updatePctToken = props.updatePctToken.bind(this)
  }

  handleChange(key, value){  
    let idx = this.props.idx,
        item = this.props.pct;

    // computed property
    item[key] = value;

    this.updatePctToken(item, idx)
  }

  render() {
    const ct = 'ct', pp = 'pp', lt = 'lt'
    return (
      <div className="PctToken">
        {ct}:
        <textarea
          className="Ct"
          value={this.props.pct[ct]}
          onChange={(e) => this.handleChange(ct, e.target.value)}
        />
        {lt}:
        <textarea
          className="Lt"
          value={this.props.pct[lt]}
          onChange={(e) => this.handleChange(lt, e.target.value)}
        />
        {pp}:
        <textarea
          className="Pp"
          value={this.props.pct[pp]}
          onChange={(e) => this.handleChange(pp, e.target.value)}
        />
      </div>
    );
  }
}

class WdToken extends Component {
  /*
    ct, rt, lt
  */
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)

    this.updateWdToken = props.updateWdToken.bind(this)
  }

  handleChange(key, value){  
    let idx = this.props.idx,
        item = this.props.wd;

    // computed property
    item[key] = value;

    this.updateWdToken(item, idx)
  }

  render() {
    const ct = 'ct', rt = 'rt', lt = 'lt'
    return (
      <div className="WdToken">
        {ct}:
        <input
          className="Ct"
          value={this.props.wd[ct]}
          onChange={(e) => this.handleChange(ct, e.target.value)}
        />
        {rt}:
        <input
          className="Rt"
          value={this.props.wd[rt]}
          onChange={(e) => this.handleChange(rt, e.target.value)}
        />
        {lt}:
        <input
          className="Lt"
          value={this.props.wd[lt]}
          onChange={(e) => this.handleChange(lt, e.target.value)}
        />
      </div>
    );
  }
}

class StcToken extends Component {
  /*
    ct, lt, pp, wd[] or pct[]
  */
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.updateWdToken = this.updateWdToken.bind(this)
    this.updatePctToken = this.updatePctToken.bind(this)

    this.updateStcToken = props.updateStcToken.bind(this)
  }

  handleChange(key, value){  
    let idx = this.props.idx,
        item = this.props.stc;

    // computed property
    item[key] = value;

    this.updateStcToken(item, idx)
  }

  // called from bottom
  updateWdToken(wd, idx){
    let item = this.props.stc['wd'];
    item[idx] = wd;
    this.handleChange('wd', item);
  }

  // called from bottom
  updatePctToken(pct, idx){
    let item = this.props.stc['pct'];
    item[idx] = pct;
    this.handleChange('pct', item);
  }

  render() {
    const ct = 'ct', lt = 'lt', pp = 'pp'
    return (
      <div className="StcToken">
        {ct}:
        <textarea
          className="Ct"
          value={this.props.stc[ct]}
          onChange={(e) => this.handleChange(ct, e.target.value)}
        />
        {lt}:
        <textarea
          className="Lt"
          value={this.props.stc[lt]}
          onChange={(e) => this.handleChange(lt, e.target.value)}
        />
        {pp}:
        <textarea
          className="Pp"
          value={this.props.stc[pp]}
          onChange={(e) => this.handleChange(pp, e.target.value)}
        />
        {this.props.stc['wd'] &&
          this.props.stc['wd'].map((wd, idx) =>
            <WdToken 
              key={idx}
              wd={wd}
              updateWdToken={this.updateWdToken}
            />)
        }
        {this.props.stc['pct'] &&
          this.props.stc['pct'].map((pct, idx) =>
            <PctToken 
              key={idx}
              pct={pct}
              updatePctToken={this.updatePctToken}
            />)
        }
      </div>
    );
  }
}

class TextInfo extends Component {
  /*
    scrt, stc[]
  */
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.updateStcToken = this.updateStcToken.bind(this)

    this.updateTextInfo = props.updateTextInfo.bind(this)
  }

  handleChange(key, value){  
    let item = this.props.t;
    // computed property
    item[key] = value;
    this.updateTextInfo('t', item);
  }

  // called from bottom
  updateStcToken(stc, idx) {
    let item = this.props.t['stc'];
    item[idx] = stc;
    this.handleChange('stc', item);
  }

  render() {
    return (
      <div className="TextInfo">
        scrt : 
        <textarea
          className="Scrt"
          value={this.props.t['scrt']}
          onChange={(e) => this.handleChange('scrt', e.target.value)}
        />
        <div className="Stc">
          stc :
          {this.props.t['stc'] &&
            this.props.t['stc'].map((stc, idx)=>
              <StcToken 
                key={idx}
                stc={stc}
                idx={idx}
                updateStcToken={this.updateStcToken}
               />)
          }
        </div>
      </div>
    );
  }
}

class SceneCut extends Component {
  /*
    st, et, t{}, lt, pp
  */
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.updateTextInfo = this.updateTextInfo.bind(this)

    this.updateSceneCut = props.updateSceneCut.bind(this)
  }

  handleChange(key, value){  
    let item = this.props.cut;
    // computed property
    item[key] = value;

    this.updateSceneCut(item, this.props.idx)
  }

  // called by bottom
  updateTextInfo(key, value){
    let item = this.props.cut[key];
    item[key] = value

    this.handleChange('t', item)
  }

  render() {
    let st = 'st', et = 'et', lt = 'lt', pp = 'pp'

    return (
      <div className="SceneCut">
        <span>
          {st} : 
          <input
            type='text'
            value={this.props.cut[st]}
            onChange={(e) => this.handleChange(st, e.target.value)}
          />
        </span>
        <span>
          {et} : 
          <input
            type='text'
            value={this.props.cut[et]}
            onChange={(e) => this.handleChange(et, e.target.value)}
          />
        </span>
        <TextInfo 
          t={this.props.cut['t']} 
          updateTextInfo={this.updateTextInfo}
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

class VideoInfo extends Component {
  /*
    source, link, c[]
  */
  constructor(props) {
    super(props)

    this.state = {
      videoInfo : props.videoInfo
    }

    this.handleChange = this.handleChange.bind(this)
    this.updateSceneCut = this.updateSceneCut.bind(this)
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

  // called from bottom
  updateSceneCut(cut, idx) {
    //  shallow copy
    let item = this.state.videoInfo['c'];
    item[idx] = cut;
    this.handleChange('c', item)
  }

  render() {
    return (
      <div>
        <span>
          source :
          <input
            type="text"
            value={this.state.videoInfo['source']}
            onChange={(e) => this.handleChange('source', e.target.value)}
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
        <div>
          {this.state.videoInfo['c'] &&
            this.state.videoInfo['c'].map((cut, idx) => 
              <SceneCut 
                key={idx} 
                cut={cut}
                idx={idx}
                updateSceneCut={this.updateSceneCut}
              />)
          }
        </div>
      </div>
    );
  }
}

export default class Main extends Component {
  constructor(props) {
    super(props)

    this.state = {
      videoInfo : props.videoInfo
    }

    this.videoInfoRef = React.createRef();
  }

  updateVideoInfo(info) {
    this.setState({videoInfo:info})
    this.videoInfoRef.current.updateVideoInfo(info)
  }

  render() {
    return (
      <div className="Main">
        <VideoInfo videoInfo={this.state.videoInfo} ref={this.videoInfoRef}/>
      </div>
    );
  }
}

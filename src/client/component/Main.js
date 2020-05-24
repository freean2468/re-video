import React, { Component } from "react";

/*
  Main > VideoInfo > ScreenCut > TextInfo > StcToken > WdToken
*/

class WdToken extends Component {
  /*
    ct, rt, lt
    never has states
  */
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleClickDelWd = this.handleClickDelWd.bind(this)

    this.updateWdToken = props.updateWdToken.bind(this)
    this.delWd = props.delWd.bind(this)
  }

  handleChange(key, value){  
    let idx = this.props.idx,
        item = this.props.wd;

    // computed property
    item[key] = value;

    this.updateWdToken(item, idx)
  }

  handleClickDelWd(){
    console.log(this.props.idx)
    this.delWd(this.props.idx)
  }

  render() {
    const ct = 'ct', rt = 'rt', lt = 'lt'
    return (
      <div className="WdToken">
        <button
          onClick={this.handleClickDelWd}
        >Del Wd</button>
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
    never has states
  */
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.updateWdToken = this.updateWdToken.bind(this)
    
    this.handleClickTokenize = this.handleClickTokenize.bind(this)
    this.handleClickDelStd = this.handleClickDelStd.bind(this)
    this.addWd = this.addWd.bind(this)
    this.delWd = this.delWd.bind(this)

    this.updateStcToken = props.updateStcToken.bind(this)
    this.delStc = props.delStc.bind(this)
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

  handleClickTokenize() {
    fetch('/api/tokenizeStc?stc='+this.props.stc['ct'])
      .then(res => res.json())
      .then(list => list.map((wd) => this.addWd(wd)))
  }

  handleClickDelStd() {
    this.delStc(this.props.idx)
  }

  addWd(wd){
    var item = this.props.stc['wd']
    if (!item) {
      item=[]
    }
    item = [...item, {
      ct:wd,
      rt:'',
      lt:''
    }]
    this.handleChange('wd', item)
  }

  delWd(idx){
    let item = this.props.stc['wd']
    item = item.slice(0,idx).concat(item.slice(idx+1))
    this.handleChange('wd', item)
  }

  render() {
    const ct = 'ct', lt = 'lt', pp = 'pp'
    return (
      <div className="StcToken">
        {ct}:
        <button
          onClick={this.handleClickTokenize}
        >Tokenize</button>
        <button
          onClick={this.handleClickDelStd}
        >Del</button>
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
              idx={idx}
              updateWdToken={this.updateWdToken}
              delWd={this.delWd}
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
    this.addStc = this.addStc.bind(this)
    this.delStc = this.delStc.bind(this)
    this.handleClickOfParse = this.handleClickOfParse.bind(this)

    this.updateTextInfo = props.updateTextInfo.bind(this)
  }

  handleClickOfParse(){
    fetch('/api/parseStc?stc='+this.props.t['scrt'])
      .then(res => res.json())
      .then(list => list.map((stc) => this.addStc(stc)))
  }

  handleChange(key, value){  
    let item = this.props.t;
    // computed property
    item[key] = value;
    this.updateTextInfo(key, item);
  }

  // called from bottom
  updateStcToken(stc, idx) {
    let item = this.props.t['stc'];
    item[idx] = stc;
    this.handleChange('stc', item);
  }

  addStc(stc){
    var item = this.props.t
    if(!item['stc']) {
      item['stc'] = [];
    }
    item['stc'] = [...item['stc'], {
      ct:stc,
      lt:'',
      pp:''
    }]
    this.updateTextInfo('t', item);
  }

  // called from bottom
  delStc(idx) {
    let item = this.props.t
    item['stc'].splice(idx, 1)
    this.updateTextInfo('t', item);
  }

  render() {
    return (
      <div className="TextInfo">
        scrt : 
        <button
          onClick={this.handleClickOfParse}
        >parse</button>
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
                delStc={this.delStc}
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
    let item = this.props.cut.t;
    item[key] = value[key]
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

class DisplayVideoInfo extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="DisplayVideoInfo">
        <pre>{JSON.stringify(this.props.videoInfo, null, 2) }</pre>
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
    this.state = {videoInfo : props.videoInfo};
    this.handleChange = this.handleChange.bind(this)
    this.handleClickInsert = this.handleClickInsert.bind(this)
    this.updateSceneCut = this.updateSceneCut.bind(this)
  }

  // refed
  updateVideoInfo(info) {
    this.setState({videoInfo : info});
  }

  handleChange(key, value) {
    let item = this.state.videoInfo
    item[key] = value
    console.log(item)
    this.setState({videoInfo : item})
  }

  handleClickInsert() {
    fetch('/api/insert', {
        method: 'POST',
        body: JSON.stringify(this.state.videoInfo),
        headers: {"Content-Type": "application/json"}
      })
      .then(res => res.json())
      .then(res => console.log(res.res))
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
            <option value="1">Witcher3</option>
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
              />)
          }
        </div>
        <div>
          <button
            onClick={this.handleClickInsert}
          >Insert</button>
        </div>
        <div>
          <DisplayVideoInfo videoInfo={this.state.videoInfo}/>
        </div>
      </div>
    );
  }
}

export default class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {videoInfo : props.videoInfo}
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

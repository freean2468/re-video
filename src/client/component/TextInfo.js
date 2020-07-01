import React, { Component } from 'react';
import StcToken from './StcToken';

export default class TextInfo extends Component {
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
  
      this.insert = props.insert.bind(this);
      this.updateTextInfo = props.updateTextInfo.bind(this);
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
          <br></br>
          <textarea
            className="Scrt"
            value={this.props.t['scrt']}
            onChange={(e) => this.handleChange('scrt', e.target.value)}
          />
          <div className="Stc">
            stc :
            <br></br>
            {this.props.t['stc'] &&
              this.props.t['stc'].map((stc, idx)=>
                <StcToken 
                  key={idx}
                  stc={stc}
                  idx={idx}
                  c={this.props.c}
                  link={this.props.link}
                  insert={this.insert}
                  updateStcToken={this.updateStcToken}
                  delStc={this.delStc}
                  buffer={this.props.buffer}
                  st={this.props.st}
                  et={this.props.et}
                />)
            }
          </div>
        </div>
      );
    }
  }
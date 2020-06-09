import React, { Component } from 'react';
import TextInfo from './TextInfo';

export default class SceneCut extends Component {
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
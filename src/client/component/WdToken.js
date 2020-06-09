import React, { Component } from 'react';

export default class WdToken extends Component {
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
  
      if (this.props.wd.dp === undefined) {
        this.props.wd.dp = '';
      }
  
      // register up to the parent states
      this.updateWdToken(this.props.wd, this.props.idx)
    }
  
    handleChange(key, value){  
      let idx = this.props.idx,
          item = this.props.wd;
  
      // computed property
      if (item[key] === undefined){
        console.log('undefined!')
        item[key] = '';
      }
      item[key] = value;
  
      this.updateWdToken(item, idx)
    }
  
    handleClickDelWd(){
      this.delWd(this.props.idx)
    }
  
    render() {
      const dp = 'dp', ct = 'ct', rt = 'rt', lt = 'lt';
      let tempDp = '';
  
      if (this.props.wd[dp] === undefined) {
        tempDp = this.props.wd[ct];
      } else {
        tempDp = this.props.wd[dp];
      }
      
      return (
        <div className="WdToken">
          <button
            onClick={this.handleClickDelWd}
          >Del Wd</button>
          [{this.props.idx}] {dp}:
          <input
            className="Dp"
            value={tempDp}
            onChange={(e) => this.handleChange(dp, e.target.value)}
          />
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
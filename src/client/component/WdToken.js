import React, { Component } from 'react';

export default class WdToken extends Component {
    /*
      dp, ct, rt, lt
    */
    constructor(props) {
      super(props);

      this.state = {
        isDisabled : true
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleClickDelWd = this.handleClickDelWd.bind(this);
      this.handleClickToggler = this.handleClickToggler.bind(this);
  
      this.insert = props.insert.bind(this);
      this.updateWdToken = props.updateWdToken.bind(this);
      this.delWd = props.delWd.bind(this);
  
      if (this.props.wd.dp === undefined) {
        this.props.wd.dp = '';
      }

      if (this.props.wd.ct === undefined && this.props.wd.rt === undefined && this.props.lt === undefined) {
        this.state.isDisabled = false;
      }
  
      // register up to the parent states
      this.updateWdToken(this.props.wd, this.props.idx);
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

    handleClickToggler() {
      let isDisabled = this.state.isDisabled;

      this.setState({isDisabled:!this.state.isDisabled});

      if (isDisabled) {
        fetch(`/api/deleteWdBase?ct=${this.props.wd.ct}&lt=${this.props.wd.lt}&link=${this.props.link}
              &c=${this.props.c}&stc=${this.props.stc}&wd=${this.props.idx}`)
          .then(res => res.json())
          .then(res => console.log('[deleteWdBase_CT_RES] : ', res))

        if (this.props.wd.rt !== '') {
          fetch(`/api/deleteWdBase?ct=${this.props.wd.rt}&lt=${this.props.wd.lt}&link=${this.props.link}
                &c=${this.props.c}&stc=${this.props.stc}&wd=${this.props.idx}`)
            .then(res => res.json())
            .then(res => console.log('[deleteWdBase_RT_RES] : ', res))
        }
      } else {
        this.insert();
      }
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
            disabled={(this.state.isDisabled)? "disabled" : ""}
          />
          {rt}:
          <input
            className="Rt"
            value={this.props.wd[rt]}
            onChange={(e) => this.handleChange(rt, e.target.value)}
            disabled={(this.state.isDisabled)? "disabled" : ""}
          />
          {lt}:
          <input
            className="Lt"
            value={this.props.wd[lt]}
            onChange={(e) => this.handleChange(lt, e.target.value)}
            disabled={(this.state.isDisabled)? "disabled" : ""}
          />
          <button
            onClick={this.handleClickToggler}
          >Toggler</button>
        </div>
      );
    }
  }
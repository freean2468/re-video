import React, { Component } from 'react';

export default class WdToken extends Component {
    /*
      dp, ct, rt, lt
    */
    constructor(props) {
      super(props);

      this.state = {
        isDisabled : true,
        ltList : []
      };

      this.handleChange = this.handleChange.bind(this);
      this.loadLtList = this.loadLtList.bind(this);
      this.handleClickDelWd = this.handleClickDelWd.bind(this);
      this.handleClickToggler = this.handleClickToggler.bind(this);
  
      this.insert = props.insert.bind(this);
      this.updateWdTokenSt = props.updateWdTokenSt.bind(this);
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

    componentDidUpdate(prevProps){
      if (prevProps.wd !== this.props.wd) {
        this.setState({
          isDisabled:true,
          ltList:[]
        })
      }
    }
  
    handleChange(key, value){  
      let idx = this.props.idx,
          item = this.props.wd;
  
      // computed property
      if (item[key] === undefined){
        // console.log(`Adding new (key,value) : (${key},${value})`);
        item[key] = '';
      }
      item[key] = value;
  
      this.updateWdToken(item, idx)
    }

    loadLtList() {
      fetch(`/api/getWdInfo?ct=${this.props.wd.ct}`)
          .then(res => res.json())
          .then(res => {
            if (res.res !== 0) {
              this.setState({ltList:res.res});  
            } else {
              console.log('[OnFocusLt] No Lt Registered')
            }
          })
    }
  
    handleClickDelWd(){
      this.delWd(this.props.idx)
    }

    handleClickToggler() {
      let isDisabled = this.state.isDisabled;

      this.setState({isDisabled:!this.state.isDisabled});

      if (isDisabled) {
        this.loadLtList();
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
        this.setState({ltList:[]});
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

      let src = null;
      if (this.props.wd.ib !== undefined) {
        function toArrayBuffer(buf) {
          var ab = new ArrayBuffer(buf.length);
          var view = new Uint8Array(ab);
          for (var i = 0; i < buf.length; ++i) {
              view[i] = buf[i];
          }
          return ab;
        }
        let data = this.props.wd.ib.data;
        if (data === undefined) {
          data = this.props.wd.ib;
        }
        
        let arrayBuffer = toArrayBuffer(data);
        src = new Blob([arrayBuffer], {type:"image/jpeg"});
      }
      
      return (
        <div className="WdToken">
          {src !== null &&
            <img src={window.URL.createObjectURL(src)} type="image/jpeg" width="40px"/>
          }
          <button
            onClick={this.handleClickDelWd}
          >Del Wd</button>
          [{this.props.idx}] 
          st:
          <input
            className="St"
            value={this.props.wd.st}
            onChange={(e) => this.updateWdTokenSt(this.props.idx, e.target.value)}
          />
          {dp}:
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
            className="Toggler"
            onClick={this.handleClickToggler}
          >Toggler</button>
          {(this.state.ltList !== []) &&
            <>
              ltList:
              <select className="LtList" defaultValue={this.props.wd.lt} 
                    onChange={(e) => this.handleChange('lt', e.target.value)}
                    disabled={(this.state.isDisabled)? "disabled" : ""}
              > 
                {this.state.ltList.map((item, idx)=>
                <option key={idx} value={item}> {item} </option>)}
              </select>
            </>
          }
        </div>
      );
    }
  }
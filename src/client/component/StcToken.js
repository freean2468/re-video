import React, { Component } from 'react';
import WdToken from './WdToken';
import StrtToken from './StrtToken';

export default class StcToken extends Component {
    /*
      ct, lt, pp, strt[], wd[]
      never has states
    */
    constructor(props) {
      super(props)
      this.state = { lt : '' };
      this.handleChange = this.handleChange.bind(this);
      this.handleClickTokenize = this.handleClickTokenize.bind(this);
      this.handleClickDelStd = this.handleClickDelStd.bind(this);
      this.handleClickTokenize = this.handleClickTokenize.bind(this);
      this.handleClickAddStrt = this.handleClickAddStrt.bind(this);
  
      this.updateStcToken = props.updateStcToken.bind(this);
      this.delStc = props.delStc.bind(this);

      this.updateStrtToken = this.updateStrtToken.bind(this);
      this.addStrt = this.addStrt.bind(this);
      this.delStrt = this.delStrt.bind(this);
      this.addWd = this.addWd.bind(this);
      this.delWd = this.delWd.bind(this);

      this.updateWdToken = this.updateWdToken.bind(this);
    }
  
    handleChange(key, value){  
      let idx = this.props.idx,
          item = this.props.stc;
  
      // computed property
      item[key] = value;
  
      this.updateStcToken(item, idx)
    }
  
    handleClickDelStd() {
      this.delStc(this.props.idx)
    }

    handleClickTokenize() {
      fetch('/api/tokenizeStc?stc='+this.props.stc['ct'])
        .then(res => res.json())
        .then(list => list.map((wd) => this.addWd(wd)))
    }

    handleClickAddStrt() {
      this.addStrt();
    }
  
    addStrt(){
      var item = this.props.stc['strt']
      if (!item) {
        item=[]
      }
  
      item = [...item, {}]
      this.handleChange('strt', item)
    }
  
    delStrt(idx){
      let item = this.props.stc['strt'];
      item.splice(idx,1);
      this.handleChange('strt', item);
    }

    // called from bottom
    updateStrtToken(strt, idx){
      let item = this.props.stc['strt'];
      item[idx] = strt;
  
      this.handleChange('strt', item);
    }


  
    // called from bottom
    updateWdToken(wd, idx){
      let item = this.props.stc['wd'];
      item[idx] = wd;
  
      let lt = '';
  
      item.map((wd)=>lt += wd['lt'] + ' ')
  
      this.setState({
        lt : lt
      })
  
      this.handleChange('wd', item);
    }
  
    addWd(wd){
      var item = this.props.stc['wd']
      if (!item) {
        item=[]
      }
  
      item = [...item, {
        dp:wd,
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
            onClick={this.handleClickAddStrt}
          >Add Strt</button>
          <button
            onClick={this.handleClickDelStd}
          >Del</button>
          <br></br>
          <textarea
            className="Ct"
            value={this.props.stc[ct]}
            onChange={(e) => this.handleChange(ct, e.target.value)}
          />
          <br></br>
          {lt}:
          <br></br>
          <textarea
            className="Lt"
            value={this.state.lt}
            onChange={(e) => this.handleChange(lt, e.target.value)}
          />
          {this.props.stc[lt]}
          <br></br>
          {pp}:
          <br></br>
          <textarea
            className="Pp"
            value={this.props.stc[pp]}
            onChange={(e) => this.handleChange(pp, e.target.value)}
          />
          <table>
            <tbody>
              <tr>
                {this.props.stc['wd'] &&
                  this.props.stc['wd'].map((wd, idx) =>
                    <td key={idx}>{idx}</td>)
                }
              </tr>
              <tr>
              {this.props.stc['wd'] &&
                  this.props.stc['wd'].map((wd, idx) =>
                    <td key={idx}>{wd.ct}</td>)
                }
              </tr>
            </tbody>
          </table>
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
          {this.props.stc['strt'] &&
            this.props.stc['strt'].map((strt, idx) =>
              <StrtToken
                key={idx}
                strt={strt}
                idx={idx}
                updateStrtToken={this.updateStrtToken}
                delStrt={this.delStrt}
                wd={this.props.stc.wd}
              />)              
          }
        </div>
      );
    }
  }
import React, { Component } from "react";
import './strtToken.css'

export default class StrtToken extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDisabled : true,
            strtList : [],
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleOnChangeStrt = this.handleOnChangeStrt.bind(this);
        this.handleChangeValInfo = this.handleChangeValInfo.bind(this);

        this.handleClickAddRt = this.handleClickAddRt.bind(this);
        this.handleClickDelRt = this.handleClickDelRt.bind(this);

        this.handleClickDelStrt = this.handleClickDelStrt.bind(this);
        this.handleOnClickToggler = this.handleOnClickToggler.bind(this);

        this.insert = props.insert.bind(this);
        this.updateStrtToken = props.updateStrtToken.bind(this);
        this.delStrt = props.delStrt.bind(this);

        if (this.props.strt.t === undefined && this.props.strt.usg === undefined) {
            this.state.isDisabled = false;
        }
        
        // register up to the parent states
        this.updateStrtToken(this.props.strt, this.props.idx);
    }

    handleChange(key, value){  
        let idx = this.props.idx,
            item = this.props.strt;
    
        // computed property
        if (item[key] === undefined){
          console.log('a new field is inserted!')
          item[key] = '';
        }
        item[key] = value;
    
        this.updateStrtToken(item, idx)
    }

    handleOnChangeStrt(value) {
        let valInfo = [];
        for (let i = 0; i < value.split(' ').length; ++i){
            valInfo.push({
                idxS:0,
                idxE:0
            })
        }

        this.handleChange('t', value);
        this.handleChange('valInfo', valInfo);
    }

    handleChangeValInfo(idx, key, value) {
        let valInfo = this.props.strt.valInfo;
        
        valInfo[idx][key] = value;

        if (valInfo[idx].idxE < valInfo[idx].idxS){
            valInfo[idx].idxE = valInfo[idx].idxS;
        }

        this.handleChange('valInfo', valInfo);
    }

    handleChangeRt(value, idx) {
        let item = this.props.strt.rt;
        item[idx] = value;
        this.handleChange('rt', item);
    }
    
    handleClickDelStrt(){
        this.delStrt(this.props.idx);
    }

    handleOnClickToggler() {
      let isDisabled = this.state.isDisabled;

      this.setState({isDisabled:!this.state.isDisabled});

      if (isDisabled) {
        fetch(`/api/getStrtInfo?rt=${this.props.strt.rt}`)
          .then(res => res.json())
          .then(res => this.setState({strtList:res.res}))

        fetch(`/api/deleteStrtFromBase?rt=${this.props.strt.rt}&t=${this.props.strt.t}&link=${this.props.link}
            &c=${this.props.c}&stc=${this.props.stc}`)
            .then(res => res.json())
            .then(res => console.log('[deleteStrtFromBase_RES] : ', res))
      } else {
        this.insert();
        this.setState({strtList:[]});
      }
    }

    handleClickAddRt() {
        let item = this.props.strt.rt;
        if (!item) {
            item = []
        }
        item = [...item, ''];
        this.handleChange('rt', item);
    }

    handleClickDelRt(idx) {
        var item = [...this.props.strt.rt];
        item.splice(idx, 1);
        this.handleChange('rt', item);
    }

    render () {
        return (
            <div className="StrtToken">
                <button
                    onClick={this.handleClickDelStrt}
                >Del Strt</button>
                <br></br>
                strt : 
                <input
                    className="Strt"
                    value={this.props.strt.t}
                    disabled={(this.state.isDisabled)? "disabled" : ""}
                />
                &nbsp; 
                {(this.state.strtList !== []) &&
                    <>
                        strtList:
                        <select    
                            defaultValue={this.props.strt.t} 
                            onChange={(e) => this.handleOnChangeStrt(e.target.value)}
                            disabled={(this.state.isDisabled)? "disabled" : ""}
                        >
                            {this.state.strtList.map((item, idx)=>
                                <option key={idx} value={item}> {item} </option>)
                            }
                        </select>
                    </>
                }
                <button
                    className="Toggler"
                    onClick={this.handleOnClickToggler}
                >Toggler</button>
                &nbsp;
                attached from : 
                <input className="From"
                    type="number"
                    value={this.props.strt.from}
                    onChange={(e) => this.handleChange('from', e.target.valueAsNumber)}
                />
                ~
                to : 
                <input className="To"
                    type="number"
                    value={this.props.strt.to}
                    onChange={(e) => this.handleChange('to', e.target.valueAsNumber)}
                />
                <br></br>
                {this.props.strt.t != undefined &&
                    this.props.strt.t.split(' ').map((token, pvIdx)=>
                        <span key={pvIdx}>
                            <table>
                                <thead>
                                    <tr>
                                        <td colSpan="44">{token}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="44">
                                            idxS:
                                            <input
                                                className="IdxStart"
                                                type="number"
                                                value={this.props.strt.valInfo[pvIdx].idxS}
                                                onChange={(e) => this.handleChangeValInfo(pvIdx, 'idxS', e.target.valueAsNumber)}
                                            />
                                            idxE:
                                            <input
                                                className="IdxEnd"
                                                type="number"
                                                value={this.props.strt.valInfo[pvIdx].idxE}
                                                onChange={(e) => this.handleChangeValInfo(pvIdx, 'idxE', e.target.valueAsNumber)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        {this.props.wd.map((wd, wdIdx)=>
                                            (wdIdx >= this.props.strt.valInfo[pvIdx].idxS && wdIdx <= this.props.strt.valInfo[pvIdx].idxE) &&
                                                <td key={wdIdx}>
                                                    {wdIdx}
                                                </td>)
                                        }
                                    </tr>
                                    <tr>
                                        {this.props.wd.map((wd, wdIdx)=>
                                            (wdIdx >= this.props.strt.valInfo[pvIdx].idxS && wdIdx <= this.props.strt.valInfo[pvIdx].idxE) &&
                                                <td key={wdIdx}>
                                                    {(wd.dp === '') ? wd.ct : wd.dp}
                                                </td>)
                                        }
                                    </tr>
                                </tbody>
                            </table>
                            &nbsp;
                        </span>)
                }
                <br></br>
                usg : 
                <textarea
                    className="Usg"
                    value={this.props.strt.usg}
                    onChange={(e) => this.handleChange('usg', e.target.value)}
                />
                <br></br>
                cmt : 
                <textarea
                    className="Cmt"
                    value={this.props.strt.cmt}
                    onChange={(e) => this.handleChange('cmt', e.target.value)}
                />
                <br></br>
                rt : 
                <button onClick={this.handleClickAddRt}>add rt</button>

                <br></br>
                {this.props.strt.rt &&
                    this.props.strt.rt.map((rt, idx) => 
                    <div key={idx}>
                        <input className="Rt"
                            value={rt}
                            key={idx}
                            onChange={(e) => this.handleChangeRt(e.target.value, idx)}
                        />
                        <button onClick={()=>this.handleClickDelRt(idx)}>del rt</button>
                        <br></br>
                    </div>
                )}
            </div>
        );
    }
}
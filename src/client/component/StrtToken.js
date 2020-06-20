import React, { Component } from "react";
import './strtToken.css'

export default class StrtToken extends Component {
    constructor(props) {
        super(props);

        this.state = {
            optionList : [],
            newStrt : ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeNewStrt = this.handleChangeNewStrt.bind(this);
        this.handleChangeT = this.handleChangeT.bind(this);
        this.handleChangeValInfo = this.handleChangeValInfo.bind(this);

        this.handleClickAddRt = this.handleClickAddRt.bind(this);
        this.handleClickDelRt = this.handleClickDelRt.bind(this);

        this.handleClickDelStrt = this.handleClickDelStrt.bind(this);
        this.handleClickNewStrt = this.handleClickNewStrt.bind(this);
        this.fetchStrtOptionList = this.fetchStrtOptionList.bind(this);

        this.updateStrtToken = props.updateStrtToken.bind(this);
        this.delStrt = props.delStrt.bind(this);
        
        // register up to the parent states
        this.updateStrtToken(this.props.strt, this.props.idx);

        this.fetchStrtOptionList();
    }

    fetchStrtOptionList(){
        fetch('/api/getStrtOptionList')
          .then(res => res.json())
          .then(list => this.setState({optionList:list}))
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

    handleChangeNewStrt(value) {
        this.setState({newStrt : value});
    }

    handleChangeT(value) {
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

    handleClickNewStrt() {
        fetch(`/api/addNewStrt?strt=${this.state.newStrt}`)
          .then(res => res.json())
          .then(res => this.fetchStrtOptionList())
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
                Strt : 
                <button
                    onClick={this.handleClickDelStrt}
                >Del Strt</button>
                <br></br>
                select : 
                <select 
                    value={this.props.strt.t} 
                    onChange={(e) => this.handleChangeT(e.target.value)}>
                    {
                        this.state.optionList !== [] &&
                            this.state.optionList.map((option, _idx)=>
                                <option key={_idx} value={option} label={option}>
                                    {option}
                                </option>)
                    }
                </select>
                &nbsp;or&nbsp; 
                <input
                    className="NewStrt"
                    value={this.state.newStrt}
                    onChange={(e) => this.handleChangeNewStrt(e.target.value)}
                />
                <button
                    onClick={this.handleClickNewStrt}
                >New Strt</button>
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
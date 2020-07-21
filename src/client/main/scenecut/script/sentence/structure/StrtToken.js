import React, { useState } from "react";
import './strtToken.css'

export default function strtToken(props) {
    const [isDisabled, setIsDisabled] = useState(true);
    const [strtList, setStrtList] = useState([]);

    function getMetadata(_key) { return props.data[_key]; }
    function getData(_key) { return props.data.data[_key]; };
    function getFromC(_key) { return getData('c')[props.idxC][_key]; };
    function getFromT(_key) { return getFromC('t')[_key]; };
    function getFromStc(_key) { return getFromT('stc')[props.idxStc][_key]; };
    function getFromStrt(_key) { return getFromStc('strt')[props.idxStrt][_key]; };

    function handleChange(_key, _value) {
        let strt = getFromStc('strt');
        strt[props.idxStrt][_key] = _value;
        props.handleChange('strt', strt);
    };

    function handleChangeStrt(value) {
        let valInfo = [];
        for (let i = 0; i < value.split(' ').length; ++i){
            valInfo.push({
                idxS:0,
                idxE:0
            })
        }

        handleChange('t', value);
        handleChange('valInfo', valInfo);
    }

    function handleChangeValInfo(idx, key, value) {
        let valInfo = getFromStrt('valInfo');
        
        valInfo[idx][key] = value;

        if (valInfo[idx].idxE < valInfo[idx].idxS){
            valInfo[idx].idxE = valInfo[idx].idxS;
        }

        handleChange('valInfo', valInfo);
    }

    function handleClickToggler() {
        setIsDisabled(!isDisabled);

        console.log(getFromStrt('rt'));
        if (isDisabled) {
            fetch(`/api/getStrtInfo?rt=${getFromStrt('rt')}`)
            .then(res => res.json())
            .then(res => setStrtList(res.res));

            fetch(`/api/deleteStrt?db=${getMetadata('DBList').value.PILOT}
                &rt=${getFromStrt('rt')}&t=${getFromStrt('t')}&usg=${getFromStrt('usg')}
                &vid=${encodeURIComponent(getMetadata('source')+getMetadata('file'))}
                &c=${props.idxC}&stc=${props.idxStc}&strt=${props.idxStrt}`)
            .then(res => res.text())
            .then(res => console.log('[deleteStrtFromBase_RES] : ', res));
        } else {
            fetch(`/api/insertStrt?db=${getMetadata('DBList').value.PILOT}
                &rt=${getFromStrt('rt')}&t=${getFromStrt('t')}}&usg=${getFromStrt('usg')}
                &vid=${encodeURIComponent(getMetadata('source')+getMetadata('file'))}
                &c=${props.idxC}&stc=${props.idxStc}&strt=${props.idxStrt}`)
            .then(res => res.text())
            .then(res => console.log('[deleteStrtFromBase_RES] : ', res));
            
            setStrtList([]);
        }
    }

    function handleClickDelStrt(){
        let strt = getFromStc('strt').filter(function(rt, _idx) {
          return props.idxStrt !== _idx;
        });
        props.handleChange('strt', strt);
    };

    function handleClickAddRt() {
        let item = getFromStrt('rt');
        if (!item) {
            item = []
        }
        item = [...item, ''];
        handleChange('rt', item);
    }

    function handleChangeRt(value, idx) {
        let item = getFromStrt('rt');
        item[idx] = value;
        handleChange('rt', item);
    }

    function handleClickDelRt(idx) {
        var item = getFromStrt('rt').filter(function(rt, _idx) {
            return idx !== _idx;
        });
        handleChange('rt', item);
    }

    return (
        <div className="StrtToken">
            <button onClick={handleClickDelStrt} >Del Strt</button><br></br>
            strt : <input className="Strt" value={getFromStrt('t')} onChange={(e) => handleChangeStrt(e.target.value)}
                        disabled={(isDisabled)? "disabled" : ""} />
            &nbsp; 
            {strtList !== [] &&
                <>
                    strtList:
                    <select defaultValue={getFromStrt('t')}  onChange={(e) => handleChangeStrt(e.target.value)}
                        disabled={isDisabled? "disabled" : ""}>
                        {strtList.map((item, idx)=> <option key={idx} value={item}> {item} </option>) }
                    </select>
                </>
            }
            <button className="Toggler" onClick={handleClickToggler} >Toggler</button>
            &nbsp; attached from : 
            <input className="From" type="number" value={getFromStrt('from')}
                onChange={(e) => handleChange('from', e.target.valueAsNumber)}
            />
            ~ to : 
            <input className="To" type="number" value={getFromStrt('to')}
                onChange={(e) => handleChange('to', e.target.valueAsNumber)}
            /> <br></br>
            {getFromStrt('t').split(' ').map((token, pvIdx)=>
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
                                    idxS: <input className="IdxStart" type="number"
                                        value={getFromStrt('valInfo')[pvIdx].idxS}
                                        onChange={(e) => handleChangeValInfo(pvIdx, 'idxS', e.target.valueAsNumber)}
                                    />
                                    idxE:
                                    <input className="IdxEnd" type="number"
                                        value={getFromStrt('valInfo')[pvIdx].idxE}
                                        onChange={(e) => handleChangeValInfo(pvIdx, 'idxE', e.target.valueAsNumber)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                {getFromStc('wd').map((wd, wdIdx)=>
                                    (wdIdx >= getFromStrt('valInfo')[pvIdx].idxS && wdIdx <= getFromStrt('valInfo')[pvIdx].idxE) &&
                                        <td key={wdIdx}>
                                            {wdIdx}
                                        </td>)
                                }
                            </tr>
                            <tr>
                                {getFromStc('wd').map((wd, wdIdx)=>
                                    (wdIdx >= getFromStrt('valInfo')[pvIdx].idxS && wdIdx <= getFromStrt('valInfo')[pvIdx].idxE) &&
                                        <td key={wdIdx}>
                                            {(wd.dp === '') ? wd.ct : wd.dp}
                                        </td>)
                                }
                            </tr>
                        </tbody>
                    </table>
                    &nbsp;
                </span>)
            } <br></br>
            usg : <textarea className="Usg" value={getFromStrt('usg')} onChange={(e) => handleChange('usg', e.target.value)} /> <br></br>
            cmt : <textarea className="Cmt" value={getFromStrt('cmt')} onChange={(e) => handleChange('cmt', e.target.value)} /> <br></br>
            rt :  <button onClick={handleClickAddRt}>add rt</button> <br></br>
            {getFromStrt('rt').map((rt, idx) => 
                <div key={idx}>
                    <input className="Rt" value={rt} key={idx} onChange={(e) => handleChangeRt(e.target.value, idx)} />
                    <button onClick={()=>handleClickDelRt(idx)}>del rt</button>
                    <br></br>
                </div>
            )}
        </div>
    );
}
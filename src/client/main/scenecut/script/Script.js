import React from 'react';
import StcToken from './sentence/StcToken';

/*
  scrt, stc[]
*/
export default function Script(props) {
  function getData(_key) { return props.data.data[_key]; };
  function getFromC(_key) { return getData('c')[props.idx][_key]; };
  function getFromT(_key) { return getFromC('t')[_key]; };

  function handleChange(_key, _value) {
    let t = getFromC('t');
    t[_key] = _value;
    props.handleChange('t', t);
  };

  function handleClickParse(){
    fetch('/api/parseStc?stc='+getFromT('scrt'))
    .then(res => res.json())
    .then(list => list.map((stc) => addStc(stc)));
  };

  function addStc(stc) {
    var item = getFromC('t');

    item.stc = [...item.stc, {
      ct:stc,
      lt:'',
      pp:'',
      wd:[],
      strt:[]
    }];

    handleChange('t', item);
  };

  return (
    <div className="TextInfo">
      scrt : <button onClick={handleClickParse} >parse</button>
      <br></br>
      <textarea className="Scrt" value={getFromT('scrt')} onChange={(e) => handleChange('scrt', e.target.value)}/>
      <div className="Stc">
        stc : <br></br>
        {getFromT('stc').map((stc, idx)=>
          <StcToken data={props.data} idxC={props.idx} idxStc={idx} handleChange={handleChange} key={idx}/>
        )}
      </div>
    </div>
  );
}
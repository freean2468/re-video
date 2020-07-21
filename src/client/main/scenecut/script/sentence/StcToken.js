import React, { useState, useEffect } from 'react';
import WdToken from './word/WdToken';
import StrtToken from './structure/StrtToken';
import VideoSynchronizer from './VideoSynchronizer';
import './stctoken.css';

/*
  ct, lt, pp, strt[], wd[]
*/

export default function StcToken(props) {
  const [lt, setLt] = useState('');

  function getData(_key) { return props.data.data[_key]; };
  function getFromC(_key) { return getData('c')[props.idxC][_key]; };
  function getFromT(_key) { return getFromC('t')[_key]; };
  function getFromStc(_key) { return getFromT('stc')[props.idxStc][_key]; };

  function handleChange(_key, _value) {
    let stc = getFromT('stc');
    stc[props.idxStc][_key] = _value;
    props.handleChange('stc', stc);
  };

  useEffect(() => {
    let wd = getFromStc('wd');
    let lt = '';
    wd.map((wd) => {
      lt += wd.lt + ' ';
    })
    setLt(lt);
  }, [getFromStc('wd')]);

  function handleClickTokenize() {
    fetch('/api/tokenizeStc?stc='+getFromStc('ct'))
    .then(res => res.json())
    .then(list => list.map((wd) => {
      let item = getFromStc('wd');

      if (!item) { item=[]; }

      item = [...item, {
        dp:'',
        ct:wd,
        rt:'',
        lt:'',
        is:true,
        st:'',
        ib:[]
      }];

      handleChange('wd', item);
    }));
  };

  function handleClickAddStrt() {
    var item = getFromStc('strt');

    if (!item) { item=[]; }

    item = [...item, {
      t:'',
      valInfo:[{
        idxS:0,
        idxE:0
      }],
      cmt:'',
      from:0,
      to:0,
      usg:'',
      rt:[]
    }];
    handleChange('strt', item);
  };

  function handleClickDelStc() {
    let stc = getFromT('stc');
    
    stc = [
      ...stc.splice(0, props.idxStc),
      ...stc.splice(props.idxStc+1)
    ];

    props.handleChange('stc', stc);
  };

  return (
    <div className="StcToken">
      ct :
      <button onClick={handleClickTokenize} >Tokenize</button>
      <button onClick={handleClickAddStrt} >Add Strt</button>
      <button onClick={handleClickDelStc} >Del</button> <br></br>
      <textarea className="Ct" value={getFromStc('ct')} onChange={(e) => handleChange('ct', e.target.value)} /> <br></br>
      lt: <br></br>
      <textarea className="Lt" value={lt} onChange={(e) => setLt(e.target.value)} />
      {getFromStc('lt')} <br></br>
      pp: <br></br>
      <textarea className="Pp" value={getFromStc('pp')} onChange={(e) => handleChange('pp', e.target.value)} />       <br></br>
      <VideoSynchronizer data={props.data} idxC={props.idxC} idxStc={props.idxStc} handleChange={handleChange} />
      {getFromStc('wd').map((wd, idx) =>
        <WdToken data={props.data} idxC={props.idxC} idxStc={props.idxStc} idxWd={idx} 
                handleChange={handleChange} key={idx}/>
      )}
      {getFromStc('strt').map((strt, idx) =>
        <StrtToken data={props.data} idxC={props.idxC} idxStc={props.idxStc} idxStrt={idx} 
                handleChange={handleChange} key={idx}/>
      )}
    </div>
  );
}
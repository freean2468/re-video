import React, { useState } from 'react';
import Script from './script/Script';
import './canvas.css';
import Canvas from './Canvas'
import Snapshot from './Snapshot';

export default function SceneCut(props) {
  const size = useSize(768);

  function getData(_key) {
    return props.data.data[_key];
  };

  function getFromC(_key) {
    return getData('c')[props.idx][_key];
  };

  function handleChange(_key, _value) {
    let c = getData('c');
    c[props.idx][_key] = _value;
    props.data.handleChange('c', c);
  };

  return (
    <div className="SceneCut">
      <div>
        st : <input value={getFromC('st')} 
                    onChange={(e)=>handleChange('st', e.target.value)} />
      </div>
      <div className="CanvasContainer">
        <Snapshot source={getData('source')} file={getData('file')} time={getFromC('st')} size={size.value}/>
        <Canvas data={props.data} idx={props.idx} cvTypeList={props.cvTypeList} size={size.value}
                handleChange={handleChange}
        />
      </div>
      <div>
        et : <input value={getFromC('et')} onChange={(e)=>handleChange('et', e.target.value)} />
      </div>
      <Snapshot source={getData('source')} file={getData('file')} time={getFromC('et')} size={size.value}/>
      <Script data={props.data} idx={props.idx} handleChange={handleChange}/>
      <div>
        lt : <textarea value={getFromC('lt')} onChange={(e)=>handleChange('lt', e.target.value)} />
      </div>
      <div>
        pp : <textarea value={getFromC('pp')} onChange={(e)=>handleChange('pp', e.target.value)} />
      </div>
    </div>
  );
}

function useSize(width) {
  const [value, setValue] = useState({width:width, height:width*9/16});

  return {
    value
  };
}
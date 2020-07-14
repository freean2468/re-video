import React, { useState, useEffect } from "react";
import './main.css';
import SceneCut from "./scenecut/SceneCut";

/*
  Main > VideoInfo > ScreenCut > TextInfo > StcToken > WdToken
*/
function Main(props) {
  return (
    <div className="Main">
      <div className="VideoInfo">
        <span className="MarginRight">
          link : <input value={props.data.data.link} 
                        onChange={(e)=>props.data.handleChange('link', e.target.value)}/>
        </span>
        <span className="MarginRight">
          source : <input value={props.data.data.source} 
                          onChange={(e)=>props.data.handleChange('source', e.target.value)}/>
          <select value={props.data.data.source} 
                  onChange={(e)=>props.data.handleChange('source', e.target.value)}>
            {props.data.sourceList.value.map((item, idx) => <option key={idx} value={idx}>{item}</option>)}
          </select>
        </span>
        <span className="MarginRight">
          file : {props.data.data.file}
          <input type="file" onChange={(e)=>props.data.handleChange('file', e.target.value)}/>
        </span>
        <div>
          {props.data.data.c.map((c, idx) => 
            <SceneCut data={props.data} idx={idx} key={idx}
              path={props.data.path} sourceList={props.data.sourceList} audioBuffer={props.data.audioBuffer}
              cvTypeList={props.data.cvTypeList}
            />) 
          }
        </div>
        <div>
          <button onClick={props.data.insert} >Insert</button>
        </div>
        <div>
          {/* this takes too much time to draw.
          <div className="DisplayVideoInfo">
              <pre>
                {JSON.stringify(metadata, null, 2) }
              </pre>
          </div> */}
        </div>
      </div>
    </div>
  );
}

function useData() {
  // data for inserting
  const [data, setData] = useState({
    source:'',
    file:'',
    link:'',
    c:[{
      st:'',
      et:'',
      lt:'',
      pp:'',
      cv:{
        ff:'',
        fs:'',
        pt:'',
        pl:'',
        pr:'',
        type:''
      },
      t:{
        scrt:'',
        stc:[]
      }
    }]
  });

  const [path, setPath] = useState('');
  const sourceList = useSourceList();
  const audioBuffer = useAudioBuffer(data.source, data.file);
  const cvTypeList = useCvTypeList(data.source);

  function init(_value, _path) {
    _value.c.map((c, idx) => {
      c.t.stc.map((stc, _idx) => {
        if (!stc.strt) _value.c[idx].t.stc[_idx].strt=[];
      })
    })
    setData(_value);
    setPath(_path);
  };

  function insert() {
    fetch(`/api/insert?folder=${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(res => console.log('[INSERT RES] ',res.res));
  };

  function handleChange(_key, _value) {
    setData({
      ...data,
      [_key]:_value
    });
  };

  return {
    data,
    path,
    sourceList,
    audioBuffer,
    cvTypeList,

    setData,
    init,
    insert,
    handleChange
  };
}

function useAudioBuffer(source, file) {
  const [value, setValue] = useState(null);
  
  useEffect(()=>{
    init(source, file);
  }, [source, file]);

  function init(source, file) {
    if (source === '' || file === '') {
      return false;
    }

    const that = this;
    fetch(`/api/getAudio?source=${source}&name=${encodeURIComponent(file)}`)
    .then(res => {
      const reader = res.body.getReader();
      let buffer = new Uint8Array(0);

      function read(reader) {
        return reader.read().then(({ done, value }) => {
          if (done) {
              const arrayBuffer = buffer.buffer,
              audioCtx = new(window.AudioContext || window.webkitAudioContext)();

              audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
                  setValue(buffer);
                },
                function (e) {
                  "Error with decoding audio data" + e.error
                }
              );
              return null;
          }

          function concatTypedArrays(a, b) { // a, b TypedArray of same type
            var c = new (a.constructor)(a.length + b.length);
            c.set(a, 0);
            c.set(b, a.length);
            return c;
          }
          buffer = concatTypedArrays(buffer, value);

          return read(reader);
        });
      };

      return read(reader);
    });
  };

  return {
    value,
    init
  };
}

function useSourceList() {
  const [value, setValue] = useState([]);

  useEffect(() => {
    init();
  },[]);

  function init() {
    fetch('/api/getSourceList')
    .then(res => res.json())
    .then(res => setValue(res.source));
  };

  return {
    value,
    init
  };
}

function useCvTypeList(source) {
  const [value, setValue] = useState([]);

  useEffect(() => {
    init(source);
  }, [source]);

  function init(source) {
    fetch(`/api/getCanvasType?source=${source}`)
    .then(res => res.json())
    .then(res => { setValue(res); });
  };

  function update(array) {
    setValue(array);
  };

  return {
    value,
    init,
    update
  };
}

export {
  Main as default,
  useData
}
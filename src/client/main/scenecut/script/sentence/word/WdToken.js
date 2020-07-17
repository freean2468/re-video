import React, { useState, useEffect } from 'react';

//     /*
//       dp, ct, rt, lt
//     */
export default function WdToken(props) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [ltList, setLtList] = useState([]);
  const src = useSrc(getFromWd('ib'));

  function getMetadata(_key) { return props.data[_key]; }
  function getData(_key) { return props.data.data[_key]; };
  function getFromC(_key) { return getData('c')[props.idxC][_key]; };
  function getFromT(_key) { return getFromC('t')[_key]; };
  function getFromStc(_key) { return getFromT('stc')[props.idxStc][_key]; };
  function getFromWd(_key) { return getFromStc('wd')[props.idxWd][_key]; };

  function handleChange(_key, _value) {
    let wd = getFromStc('wd');
    wd[props.idxWd][_key] = _value;
    props.handleChange('wd', wd);
  };

  function handleClickDelWd(){
    let wd = getFromStc('wd').filter(function(rt, _idx) {
      return props.idxWd !== _idx;
    });
    props.handleChange('wd', wd);
  };

  function handleClickToggler() {
    setIsDisabled(!isDisabled);

    if (isDisabled) {
      fetch(`/api/getWdInfo?ct=${getFromWd('ct')}`)
      .then(res => res.json())
      .then(res => {
        if (res.res !== 0) {
          setLtList(res.res);  
        } else {
          console.log('[OnFocusLt] No Lt Registered')
        }
      });

      fetch(`/api/deleteWd?db=${getMetadata('DBList').value.PILOT}&ct=${getFromWd('ct')}&lt=${getFromWd('lt')}
            &link=${encodeURIComponent(getData('source')+getData('file'))}
            &c=${props.idxC}&stc=${props.idxStc}&wd=${props.idxWd}`)
      .then(res => res.json())
      .then(res => console.log('[deleteWdBase_CT_RES] : ', res))

      if (getFromWd('rt') !== '') {
        fetch(`/api/deleteWd?db=${getMetadata('DBList').value.PILOT}&ct=${getFromWd('rt')}&lt=${getFromWd('lt')}  
              &link=${encodeURIComponent(getData('source')+getData('file'))}
              &c=${props.idxC}&stc=${props.idxStc}&wd=${props.idxWd}`)
        .then(res => res.json())
        .then(res => console.log('[deleteWdBase_RT_RES] : ', res))
      }
    } else {
      fetch(`/api/insertWd?db=${getMetadata('DBList').value.PILOT}&ct=${getFromWd('ct')}&lt=${getFromWd('lt')}
            &link=${encodeURIComponent(getData('source')+getData('file'))}
            &c=${props.idxC}&stc=${props.idxStc}&wd=${props.idxWd}`)
      .then(res => res.json())
      .then(res => console.log('[INSERT_WD(CT)_RES] ',res.res));

      if (getFromWd('rt') !== '') {
        fetch(`/api/insertWd?db=${getMetadata('DBList').value.PILOT}&ct=${getFromWd('rt')}&lt=${getFromWd('lt')}
              &link=${encodeURIComponent(getData('source')+getData('file'))}
              &c=${props.idxC}&stc=${props.idxStc}&wd=${props.idxWd}`)
        .then(res => res.json())
        .then(res => console.log('[INSERT_WD(RT)_RES] : ', res))
      }

      setLtList([]);
    }
  };

  function updateSt(st) {
    let wd = getFromStc('wd');
    wd[props.idxWd].st = st;

    if (st > getFromC('et')) {
      props.handleChange('wd', wd);
      return false;
    }

    if (getData('file') !== '') {
      fetch(`/api/getSnapshot?source=${getData('source')}
              &name=${encodeURIComponent(getData('file'))}
              &t=${st}&size=160x90`)
      .then(res => res.blob())
      .then(res => {
        // console.log(res);
        let arrayBuffer = null;
        const fileReader = new FileReader();

        fileReader.onload = function(event) {
            arrayBuffer = event.target.result;
            // console.log(arrayBuffer);

            function toBuffer(ab) {
            var buf = Buffer.alloc(ab.byteLength);
            var view = new Uint8Array(ab);
            for (var i = 0; i < buf.length; ++i) {
                buf[i] = view[i];
            }
            return buf;
            }

            let buffer = toBuffer(arrayBuffer);

            // console.log(buffer);

            wd[props.idxWd].ib = '';
            wd[props.idxWd].ib = buffer;
            props.handleChange('wd', wd);

            // console.log(new Blob([arrayBuffer], {type:"image/jpeg"}));
        };
        fileReader.readAsArrayBuffer(res);
      });
    }
  };

  return (
    <div className="WdToken">
      {src.value !== null &&
        <img src={src.value} type="image/jpeg" width="40px"/>
      }
      <button onClick={handleClickDelWd} >Del Wd</button>
      [{props.idxWd}] 
      st: <input className="St" value={getFromWd('st')} onChange={(e) => updateSt(e.target.value)} />
      dp: <input className="Dp" value={getFromWd('dp')} onChange={(e) => handleChange('dp', e.target.value)} />
      ct: <input className="Ct" value={getFromWd('ct')} onChange={(e) => handleChange('ct', e.target.value)}
                disabled={(isDisabled)? "disabled" : ""}/>
      rt: <input className="Rt" value={getFromWd('rt')} onChange={(e) => handleChange('rt', e.target.value)}
                disabled={(isDisabled)? "disabled" : ""}/>
      lt: <input className="Lt" value={getFromWd('lt')} onChange={(e) => handleChange('lt', e.target.value)}
                disabled={(isDisabled)? "disabled" : ""}/>
      <button className="Toggler" onClick={handleClickToggler} >Toggler</button>
      {ltList !== [] &&
        <>
          ltList: 
          <select className="LtList" defaultValue={getFromWd('lt')} onChange={(e) => handleChange('lt', e.target.value)}
                  disabled={isDisabled ? "disabled" : ""}
          > 
            {ltList.map((item, idx) => <option key={idx} value={item}> {item} </option>)}
          </select>
        </>
      }
    </div>
  );
}

function useSrc(ib) {
  const [value, setValue] = useState(null);

  useEffect(()=>{
    function toArrayBuffer(buf) {
      let ab = new ArrayBuffer(buf.length);
      let view = new Uint8Array(ab);
      for (let i = 0; i < buf.length; ++i) {
          view[i] = buf[i];
      }
      return ab;
    }

    let data = ib.data;
    if (data === undefined) {
      data = ib;
    }
    
    let arrayBuffer = toArrayBuffer(data);
    setValue(window.URL.createObjectURL(new Blob([arrayBuffer], {type:"image/jpeg"})));
  },[ib]);

  return {
    value
  };
}
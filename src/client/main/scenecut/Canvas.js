import React, { useState, useEffect } from 'react';
import WdDisplay from './WdDisplay'

export default function Canvas(props) {
    const canvas = useCanvas(props.size);
    const script = useScript(getFromC('t').stc, props.size, getFromC('cv'));

    function getData(_key) {
        return props.data.data[_key];
    };

    function getFromC(_key) {
        return getData('c')[props.idx][_key];
      };

    function getFromCv(_key) {
        return getData('c')[props.idx].cv[_key];
    };

    function handleChange(_key, _value) {
        let cv = getFromC('cv');
        cv[_key] = _value;
        props.handleChange('cv', cv);
    };

    function handleChangeType(value) {
        fetch(`/api/getCanvasInfo?source=${getData('source')}&type=${value}`)
        .then(res => res.json())
        .then(res => {
            res.type = value;
            props.handleChange('cv', res);
        });
    };

    function handleClickAdd() {
        let json = getFromC('cv');

        fetch(`/api/addCanvasInfo?source=${getData('source')}&type=${getFromCv('type')}`, {
            method: 'POST',
            body: JSON.stringify(json),
            headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(res => { 
            props.cvTypeList.update(res); 
        });
    };

    return (
        <>
            {canvas.render()}
            {script.render()}
            {getFromC('st') !== '' &&
                <span className="CanvasOptions">
                    type: 
                    <input value={getFromCv('type')} onChange={(e) => handleChange('type', e.target.value)} />
                    typeList:
                    <select defaultValue={getFromCv('type')} onChange={(e)=>handleChangeType(e.target.value)}>
                        {props.cvTypeList.value.map((item) => <option key={item} value={item}>{item}</option> )}
                    </select>
                    (x: {canvas.value.x}%, y: {canvas.value.y}%) 
                    <br></br>
                    pt: <input type="number" value={getFromCv('pt')} onChange={(e) => handleChange('pt', e.target.value)} />%
                    pl: <input type="number" value={getFromCv('pl')} onChange={(e) => handleChange('pl', e.target.value)} />%
                    pr: <input type="number" value={getFromCv('pr')} onChange={(e) => handleChange('pr', e.target.value)} />%
                    <br></br>
                    fs: <input type="number" value={getFromCv('fs')} onChange={(e) => handleChange('fs', e.target.value)} />
                    ff: <select value={getFromCv('ff')} onChange={(e) => handleChange('ff', e.target.value)}>
                            <option value="PT Sans, sans-serif">PT Sans, sans-serif</option>
                            <option value="sth">sth</option>
                        </select>
                    <br></br>
                    <button onClick={handleClickAdd}>
                        Add canvas info
                    </button>
                </span>
            }
        </>
    );
}

function useCanvas(size) {
    const [value, setValue] = useState({x:0, y:0});
    const [ctx, setCtx] = useState(null);
    const [ref] = useState(React.createRef());
    
    useEffect(()=>{
        let ctx = ref.current.getContext("2d");

        ctx.clearRect(0,0,size.width,size.height);
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.rect(size.width*value.x/100, size.height*value.y/100, 10, 10)
        ctx.stroke();

        setCtx(ctx);
    }, [value]);

    function handleMouseDown(e) {
        var x = e.nativeEvent.offsetX;
        var y = e.nativeEvent.offsetY;

        ctx.clearRect(0,0,size.width,size.height);

        x = x/ref.current.offsetWidth*100;
        y = y/ref.current.offsetHeight*100;

        x=Number((x).toFixed(1));
        y=Number((y).toFixed(1));

        setValue({x:x, y:y});
    };

    function render() {
        return (
            <canvas className="Canvas" onMouseDown={handleMouseDown} ref={ref}
                width={size.width} height={size.height}/>
        );
    };

    return {
        value,
        render
    };
}

function useScript(stc, size, cv) {
    const [value, setValue] = useState([]);

    useEffect(() => {
        let scrt = [];

        // display
        for (let j = 0; j < stc.length; ++j) {
            let ct = stc[j].ct, wd = stc[j].wd, wholeLength = -1;

            if (!wd) return;
            
            for (let k = 0; k < wd.length; ++k) {
                let dp = wd[k].dp,
                    isSpace = true;
                if (dp === ''){
                    dp = wd[k].ct;
                }

                wholeLength += dp.length;

                if (ct[wholeLength+1] === ' ' || ct[wholeLength+1] === undefined){
                    wholeLength += 1;
                } else {
                    isSpace = false;
                }

                scrt.push(<WdDisplay key={`${j}${k}`} token={dp} isSpace={isSpace}/>);
            }
        }

        setValue(scrt);
    }, [stc]);

    function render() {
        return (
            <div className="TextDisplay"
                style={{
                    width:`${size.width}px`,
                    height:`${size.height}px`,
                    fontSize:`${cv.fs*size.width/1920*0.5625}px`,
                    fontFamily:`${cv.ff}`,
                    paddingLeft:`${cv.pl}%`,
                    paddingRight:`${cv.pr}%`,
                    paddingTop:`${cv.pt}%`,
                }}
            >
                {value.map((token)=>token)}
            </div>
        );
    }

    return {
        value,
        render
    };
}
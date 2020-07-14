import React, { useState, useEffect, useRef } from 'react';
import './videosynchronizer.css';

export default function VideoSynchronizer(props) {
    const [selectedIdx, setSelectedIdx] = useState(null);
    let mouseX = 0, clickX = null;
    let playingTime = null;
    let audioCtx = null;
    let maxEt = null;
    let drawTimerId = null;
    let drawTime = 0;
    const cvRef = useRef(null);
    let isPlaying = false;

    function getMetadata(_key) { return props.data[_key]; }
    function getData(_key) { return props.data.data[_key]; };
    function getFromC(_key) { return getData('c')[props.idxC][_key]; };
    function getFromT(_key) { return getFromC('t')[_key]; };
    function getFromStc(_key) { return getFromT('stc')[props.idxStc][_key]; };

    useEffect(() => {
        if (getMetadata('audioBuffer').value !== null) {
            drawSineWave();
        }
        setSelectedIdx(null);
    },[getMetadata('audioBuffer').value]);

    useEffect(() => {

    },[getFromStc])

    function handleClickWd(idx) {
        if (idx === selectedIdx) {
            setSelectedIdx(null);
        } else {
            setSelectedIdx(idx);
        }
    };

    function handleMouseMove(e) {
        if (getData('file') === '') return;
        
        mouseX = e.clientX - cvRef.current.offsetLeft;
        if (!isPlaying) {
            playAudio(e, 0.05);
        }
        drawSineWave();
    };

    function handleClick(e) {
        const x = e.clientX - cvRef.current.offsetLeft;
        const width = cvRef.current.offsetWidth;
        const durationX = getDurationOffsetX(x/width);
        clickX = x;

        if (selectedIdx !== null) {
            updateWdTokenSt(selectedIdx, durationX);
        }

        playAudio(e, 1);
        
        if (drawTimerId !== null) {
            clearTimeout(drawTimerId);
            drawTime = 0;
        }
        drawForSeconds(1);
    };

    function handleChangeSyncPanel(e) {
        maxEt = e.target.value;
        drawSineWave();
    };

    function updateWdTokenSt(idx, st) {
        let item = getFromStc('wd');
        item[idx].st = st;

        if (st > getFromC('et')) {
            props.handleChange('wd', item);
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

                    item[idx].ib = '';
                    item[idx].ib = buffer;
                    props.handleChange('wd', item);

                    // console.log(new Blob([arrayBuffer], {type:"image/jpeg"}));
                };
                fileReader.readAsArrayBuffer(res);
            });
        }
    };

    function getStcSt() {
        let wd = getFromStc('wd');

        if (wd.length > 0) {
            let st = wd[0].st;
            if (st === '') {
                return getFromC('st');
            }
            return wd[0].st;
        } else {
            return getFromC('st');
        }
    }

    function getChannelOffsetX(percentage) {
        const st = getStcSt(), et = maxEt || getFromC('et');
        const etChannelOffset = et / getMetadata('audioBuffer').value.duration * getMetadata('audioBuffer').value.length;
        const stChannelOffset = st / getMetadata('audioBuffer').value.duration * getMetadata('audioBuffer').value.length;
        const adjustedOffset = stChannelOffset + (percentage*(etChannelOffset-stChannelOffset));

        return Math.round(adjustedOffset);
    };

    function getDurationOffsetX(percentage) {
        const st = getStcSt(), et = maxEt || getFromC('et');
        const duration = et - st;

        return parseFloat(parseFloat(st) + parseFloat(percentage * duration)).toFixed(2);
    }

    function getStcDuration() {
        let duration = (maxEt || getFromC('et')) - getStcSt();

        return duration;
    };

    function getWdDurationX(durationX) {
        return parseFloat(parseFloat(durationX-getStcSt()) / getStcDuration() * cvRef.current.offsetWidth).toFixed(2);
    }

    function drawForSeconds(seconds) {
        const interval = 10;

        drawSineWave();

        if (drawTime >= (seconds*1000)) {
            drawTimerId = null;
            drawTime = 0;
        } else {
            drawTimerId = setTimeout(drawForSeconds.bind(null, seconds), interval);
            drawTime = drawTime + interval;
        }
    }

    function drawSineWave() {
        if (getMetadata('audioBuffer').value !== null) {
            const sinewaveСanvasCtx = cvRef.current.getContext("2d"),
                width = cvRef.current.offsetWidth, height = cvRef.current.offsetHeight, 
                middle = height / 2;;
        
            // draw bg
            sinewaveСanvasCtx.clearRect(0, 0, width, height);
            sinewaveСanvasCtx.fillStyle='rgb(125, 125, 125)';
            sinewaveСanvasCtx.fillRect(0, 0, width, height);
        
            let waveScale = 3;

            sinewaveСanvasCtx.strokeStyle = "rgb(220, 220, 220)";

            // draw sinewave
            for (let i = 0; i < width; i += 1) {
                const x = getChannelOffsetX(i/width);
                const item = getMetadata('audioBuffer').value.getChannelData(0)[x] || 0;
        
                sinewaveСanvasCtx.beginPath();
                sinewaveСanvasCtx.moveTo(i, middle + (waveScale*item*middle));
                sinewaveСanvasCtx.lineTo(i, middle - (waveScale*item*middle));
                sinewaveСanvasCtx.stroke();
            }

            // draw mouse line
            sinewaveСanvasCtx.strokeStyle = "rgb(255, 0, 0)";
            sinewaveСanvasCtx.beginPath();
            sinewaveСanvasCtx.moveTo(mouseX, 0);
            sinewaveСanvasCtx.lineTo(mouseX, height);
            sinewaveСanvasCtx.stroke();

            // draw playing line
            sinewaveСanvasCtx.strokeStyle = "rgb(0, 255, 0)";
            if (clickX !== null) {
                sinewaveСanvasCtx.beginPath();
                if (isPlaying) {
                    const timeDiff = (audioCtx.currentTime - playingTime);
                    let offsetX = timeDiff/getStcDuration();
                    offsetX = offsetX*cvRef.current.offsetWidth;
                    sinewaveСanvasCtx.moveTo(clickX + offsetX, 0);
                    sinewaveСanvasCtx.lineTo(clickX + offsetX, height);
                } else {
                    sinewaveСanvasCtx.moveTo(clickX, 0);
                    sinewaveСanvasCtx.lineTo(clickX, height);
                }
                sinewaveСanvasCtx.stroke();
            }

            // draw timeline
            sinewaveСanvasCtx.font = '14px serif';

            sinewaveСanvasCtx.strokeStyle="rgb(0,0,0)";
            sinewaveСanvasCtx.fillStyle="rgb(0,0,0)";

            for (let i=0; i <= width; i += width/10) {
                let percentage = i/width;
                sinewaveСanvasCtx.fillText(`${parseFloat(getStcDuration()*percentage+parseFloat(getStcSt())).toFixed(1)}`, i, 15);
            }

            // draw wd
            sinewaveСanvasCtx.strokeStyle="rgb(0,0,255)";

            let wd = getFromStc('wd');
            for (let i = 0; i < wd.length; ++i) {
                let durationX = wd[i].st;
                if (durationX === '') {
                    durationX = width/wd.length*i
                } else {
                    durationX = getWdDurationX(durationX);
                }
                sinewaveСanvasCtx.fillText(`${wd[i].ct}`, durationX, height-10);
                sinewaveСanvasCtx.beginPath();
                sinewaveСanvasCtx.moveTo(durationX, 0);
                sinewaveСanvasCtx.lineTo(durationX, height);
                sinewaveСanvasCtx.stroke();
            }
        }
    };
    
    function playAudio(e, wantedDuration) {
        const x = e.clientX - cvRef.current.offsetLeft;
        const width = cvRef.current.offsetWidth;

        const durationX = getDurationOffsetX(x/width);

        const ctx = new window.AudioContext();
        let source = ctx.createBufferSource();

        source.buffer = getMetadata('audioBuffer').value;
        source.playbackRate.value = 1;
        source.connect(ctx.destination);
        source.loop = false;

        source.start(0, durationX, wantedDuration);
        source.stop(wantedDuration);

        audioCtx = ctx;
        mouseX = x;
        isPlaying = true;
        playingTime = audioCtx.currentTime;

        setTimeout(()=>{
            audioCtx = null;
            mouseX = x;
            isPlaying = false;
            playingTime = null;
            ctx.close();
        }, wantedDuration*1000);
    }

    return (
        <div className="VideoSynchronizer">
            <table className="WdTable">
                <tbody>
                    <tr>
                        {getFromStc('wd').map((wd, idx) =>
                            <td key={idx} onClick={()=>handleClickWd(idx)}>
                                { idx === selectedIdx ?
                                    <p style={{backgroundColor:"#bbbbbb"}}>
                                        {idx}<br></br>
                                        {wd.ct}
                                    </p>
                                    :
                                    <>
                                        {idx}<br></br>
                                        {wd.ct}
                                    </>
                                }
                            </td>
                        )}
                    </tr>
                </tbody>
            </table>
            <canvas className="VideoSync" ref={cvRef}  width="1324" height="100" onMouseMove={handleMouseMove}
                onClick={handleClick}></canvas>
            <input className="SyncPanel" type="range" min={getStcSt()} max={getFromC('et')}
                onChange={handleChangeSyncPanel}
            />
            :maxEt ({maxEt})
        </div>
    );
}
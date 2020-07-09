import React, { Component } from 'react';
import WdDisplay from './WdDisplay'

export default class TextCanvas extends Component {
    constructor(props){
        super(props)

        this.state = {
            x : 0,
            y : 0,
            interval : null,
            scrt:[]
        }

        this.container = React.createRef();
        this.canvasRef = React.createRef();

        this.ctx = null;

        this.handleClickInsert = this.handleClickInsert.bind(this);
        this.handleClickLoad = this.handleClickLoad.bind(this);
        this.handleOnMouseDown = this.handleOnMouseDown.bind(this);
        this.updateCanvasInfo = props.updateCanvasInfo.bind(this);
    }

    initiateDisplay() {
        let scrt = [];
        let stc = this.props.t.stc;

        for (let j = 0; j < stc.length; ++j) {
            let ct = stc[j].ct,
                wd = stc[j].wd,
                strt = stc[j].strt,
                dpList = [],
                ltList = [],
                wholeLength = -1;

            for (let k = 0; k < wd.length; ++k) {
                let dp = wd[k].dp;
                if (dp === ''){
                    dp = wd[k].ct;
                }
                dpList.push(dp);
                ltList.push(wd[k].lt);
            }

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

                let strtPick = null;
                
                if (strt !== undefined) {
                    for (let l = 0; l < strt.length; ++l) {
                        if (strt[l].from <= k && k <= strt[l].to) {
                            strtPick = strt[l];
                            break;
                        }
                    }
                }

                scrt.push(<WdDisplay key={`${j}${k}`} token={dp} isSpace={isSpace}/>);
            }
        }

        this.setState({scrt:scrt});

        if (this.props.cv === undefined) {
            fetch(`/api/getCanvasInfo?source=${this.props.source}`)
                .then(res => res.json())
                .then(res => {
                    this.handleChange('pt', res.cv.pt);
                    this.handleChange('pl', res.cv.pl);
                    this.handleChange('pr', res.cv.pr);
                    this.handleChange('fs', res.cv.fs);
                    this.handleChange('ff', res.cv.ff);
                })
        }
    }

    componentDidMount() {
        this.initiateDisplay();
        
        this.ctx = this.canvasRef.current.getContext("2d");

        this.setState({interval : setInterval(() => {
            this.ctx.clearRect(0,0,this.props.width,this.props.height);
            this.ctx.beginPath();
            this.ctx.strokeStyle = "red";
            this.ctx.rect(this.props.width*this.state.x/100, this.props.height*this.state.y/100, 10, 10)
            this.ctx.stroke();
        }, 1000)});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.t.stc !== this.props.t.stc) {
            this.initiateDisplay();
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
    }

    handleChange(key, value) {
        let item = value;
        this.updateCanvasInfo(key, item);
    }

    handleClickLoad() {
        fetch(`/api/getCanvasInfo?source=${this.props.source}`)
            .then(res => res.json())
            .then(res => {
                this.handleChange('pt', res.cv.pt);
                this.handleChange('pl', res.cv.pl);
                this.handleChange('pr', res.cv.pr);
                this.handleChange('fs', res.cv.fs);
                this.handleChange('ff', res.cv.ff);
            })
    }

    handleClickInsert() {
        let json = this.props.cv;
        json['source'] = this.props.source;

        fetch('/api/insertCanvasInfo', {
            method: 'POST',
            body: JSON.stringify(json),
            headers: {"Content-Type": "application/json"}
          })
          .then(res => res.json())
          .then(res => console.log('[IST CV RES] ',res.res))
    }

    handleOnMouseDown(e){
        var x = e.nativeEvent.offsetX;
        var y = e.nativeEvent.offsetY;

        this.ctx.clearRect(0,0,this.props.width,this.props.height);

        x = x/this.canvasRef.current.offsetWidth*100;
        y = y/this.canvasRef.current.offsetHeight*100;

        x=Number((x).toFixed(1));
        y=Number((y).toFixed(1));

        this.setState({x:x, y:y});
    }

    render() {
        let pt = 0, pl = 0, pr = 0, fs = 0, ff='';
        if (this.props.cv) {
            if (this.props.cv.pt) pt = this.props.cv.pt
            if (this.props.cv.pl) pl = this.props.cv.pl
            if (this.props.cv.pr) pr = this.props.cv.pr
            if (this.props.cv.fs) fs = this.props.cv.fs
            if (this.props.cv.ff) ff = this.props.cv.ff
        }

        return (
            <>
                <canvas className="TextCanvas" onMouseDown={this.handleOnMouseDown} ref={this.canvasRef}
                    width={this.props.width} height={this.props.height}/>
                <div className="TextDisplay" ref={this.displayRef} 
                    style={{
                        width:`${this.props.width}px`,
                        height:`${this.props.height}px`,
                        fontSize:`${fs*this.props.width/1920*0.5625}px`,
                        fontFamily:`${ff}`,
                        paddingLeft:`${pl}%`,
                        paddingRight:`${pr}%`,
                        paddingTop:`${pt}%`,
                    }}
                >
                    {this.state.scrt.map((token)=>token)}
                </div>
                <span className="CanvasOptions">
                    (x: {this.state.x}%, y: {this.state.y}%)
                    <br></br>
                    pt: <input value={pt}
                            onChange={(e) => this.handleChange('pt', e.target.value)}
                        />%
                    pl: <input value={pl}
                            onChange={(e) => this.handleChange('pl', e.target.value)}
                        />%
                    pr: <input value={pr}
                            onChange={(e) => this.handleChange('pr', e.target.value)}
                        />%
                    <br></br>
                    fs: <input value={fs}
                            onChange={(e) => this.handleChange('fs', e.target.value)}
                        />
                    ff: <select value={ff} onChange={(e) => this.handleChange('ff', e.target.value)}>
                            <option value="PT Sans, sans-serif">PT Sans, sans-serif</option>
                            <option value="sth">sth</option>
                        </select>
                    <br></br>
                    <button onClick={this.handleClickInsert}>
                        Insert canvas info
                    </button>
                    <button onClick={this.handleClickLoad}>
                        Load canvas info
                    </button>
                </span>
            </>
        );
    }
}
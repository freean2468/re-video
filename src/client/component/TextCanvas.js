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

        this.handleClickAdd = this.handleClickAdd.bind(this);
        this.handleOnMouseDown = this.handleOnMouseDown.bind(this);
        this.handleOnChangeOnSelect = this.handleOnChangeOnSelect.bind(this);

        this.updateCanvasInfo = props.updateCanvasInfo.bind(this);
        this.updateCanvasItself = props.updateCanvasItself.bind(this);
        this.updateCvTypeList = props.updateCvTypeList.bind(this);
    }

    initiateDisplay() {
        let scrt = [];
        let stc = this.props.t.stc;

        // display
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

        // type
        console.log(this.props.cv.type);
        this.handleOnChangeOnSelect(this.props.cv.type);
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
        // console.log('TextCanvas Did Update');
        if (prevProps.t.stc !== this.props.t.stc) {
            // console.log('TextCanvas Did Update Inside');
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

    handleClickAdd() {
        let json = this.props.cv;

        fetch(`/api/addCanvasInfo?source=${this.props.source}&type=${this.props.cv.type}`, {
            method: 'POST',
            body: JSON.stringify(json),
            headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(res => {
            this.updateCvTypeList(res);
        })
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

    handleOnChangeOnSelect(value) {
        fetch(`/api/getCanvasInfo?source=${this.props.source}&type=${value}`)
        .then(res => res.json())
        .then(res => {
            res.type = value;
            this.updateCanvasItself(res);
        });
    }

    render() {
        return (
            <>
                <canvas className="TextCanvas" onMouseDown={this.handleOnMouseDown} ref={this.canvasRef}
                    width={this.props.width} height={this.props.height}/>
                <div className="TextDisplay" ref={this.displayRef} 
                    style={{
                        width:`${this.props.width}px`,
                        height:`${this.props.height}px`,
                        fontSize:`${this.props.cv.fs*this.props.width/1920*0.5625}px`,
                        fontFamily:`${this.props.cv.ff}`,
                        paddingLeft:`${this.props.cv.pl}%`,
                        paddingRight:`${this.props.cv.pr}%`,
                        paddingTop:`${this.props.cv.pt}%`,
                    }}
                >
                    {this.state.scrt.map((token)=>token)}
                </div>
                <span className="CanvasOptions">
                    type: 
                    <input value={this.props.cv.type}
                        onChange={(e) => this.handleChange('type', e.target.value)}
                    />
                    typeList:
                    <select defaultValue={this.props.cv.type} onChange={(e)=>this.handleOnChangeOnSelect(e.target.value)}>
                        {this.props.cvTypeList.map((item) => 
                            <option key={item} value={item}>{item}</option>
                        )}
                    </select>
                    (x: {this.state.x}%, y: {this.state.y}%) 
                    <br></br>
                    pt: <input value={this.props.cv.pt}
                            type="number"
                            onChange={(e) => this.handleChange('pt', e.target.value)}
                        />%
                    pl: <input value={this.props.cv.pl}
                            type="number"
                            onChange={(e) => this.handleChange('pl', e.target.value)}
                        />%
                    pr: <input value={this.props.cv.pr}
                            type="number"
                            onChange={(e) => this.handleChange('pr', e.target.value)}
                        />%
                    <br></br>
                    fs: <input value={this.props.cv.fs}
                            type="number"
                            onChange={(e) => this.handleChange('fs', e.target.value)}
                        />
                    ff: <select value={this.props.cv.ff} onChange={(e) => this.handleChange('ff', e.target.value)}>
                            <option value="PT Sans, sans-serif">PT Sans, sans-serif</option>
                            <option value="sth">sth</option>
                        </select>
                    <br></br>
                    <button onClick={this.handleClickAdd}>
                        Add canvas info
                    </button>
                </span>
            </>
        );
    }
}
import React, { Component } from 'react';

class SearchGroup extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="file name or contents"
          value={""}
          onChange={()=>{}}
        />
      </div>
    );
  }
}

class ListItem extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault();
    fetch('/api/getFile?name='+this.props.name)
      .then(res => res.json())
      .then(file => this.props.loadVideo(file))
  }

  render() {
    return (
      <li onClick={this.handleClick}>
        <a href="#">
          {this.props.name}
        </a>
      </li>
    );
  }
}

class FileList extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const list = this.props.list

    return (
      <div>
        <ul>
          {list.map((name) => <ListItem key={name} name={name} loadVideo={this.props.loadVideo}/>)}
        </ul>
      </div>
    );
  }
}

export default class Nav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      videoList : []
    }
  }

  componentDidMount() {
    fetch('/api/getFileList')
      .then(res => res.json())
      .then(list => this.setState({videoList:list}))
  }

  render() {
    return (
      <div className="Nav">
        <SearchGroup/>
        <FileList 
          list={this.state.videoList} 
          loadVideo={this.props.loadVideo}
        />
      </div>
    );
  }
}

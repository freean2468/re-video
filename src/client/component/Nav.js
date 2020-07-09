import React, { Component } from 'react';
import './nav.css'

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
    super(props);
    
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    fetch(`/api/getFile?fileName=${encodeURIComponent(this.props.fileName)}
          &folder=${encodeURIComponent(this.props.folder)}`)
    .then(res => res.json())
    .then(file => {
      this.props.loadVideoData(this.props.folder, file)
    });
  }

  render() {
    return (
      <li className="ListItem" onClick={this.handleClick}>
        <a className="List" href="#">
          {this.props.fileName}
        </a>
      </li>
    );
  }
}

class NavList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFolder:null
    }

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(key) {
    if (this.state.selectedFolder === key) {
      this.setState({selectedFolder:null});
    } else {
      this.setState({selectedFolder:key});
    }
  }

  render() {
    return (
      <div className="NavList">
        <ul>
          {Object.keys(this.props.list).map((folder) => 
            <div className="Folder" key={folder} onClick={(e)=>this.handleOnClick(folder)}>
              {this.state.selectedFolder === folder ?
                '+'+folder : '-'+folder
              }
              
              {this.state.selectedFolder === folder &&
                this.props.list[folder].map((fileName) =>
                  <ListItem key={fileName} folder={folder} fileName={fileName} 
                            loadVideoData={this.props.loadVideoData}
                  />
              )}
            </div>
          )}
        </ul>
      </div>
    );
  }
}

export default class Nav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      navList : []
    }
  }

  componentDidMount() {
    fetch('/api/getNavList')
    .then(res => res.json())
    .then(list => this.setState({navList:list}))
  }

  render() {
    return (
      <div className="Nav">
        <SearchGroup/>
        <NavList 
          list={this.state.navList}
          loadVideoData={this.props.loadVideoData}
        />
      </div>
    );
  }
}

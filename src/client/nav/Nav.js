import React, { useState, useEffect } from 'react';
import './nav.css'
import SearchGroup from './SearchGroup';

export default function Nav(props) {
  const nav = useNav();
  const selected = useSelected();

  function handleClick(e, fileName, folder) {
      e.preventDefault();
      e.stopPropagation();
      fetch(`/api/getFile?fileName=${encodeURIComponent(fileName)}
            &folder=${encodeURIComponent(folder)}`)
      .then(res => res.json())
      .then(file => props.init(file, folder));
  }

  return (
    <div className="Nav">
      <SearchGroup/>
      <div className="NavList">
        <ul>
          {Object.keys(nav.value).map((folder) => 
            <div className="Folder" key={folder} onClick={()=>selected.handleClick(folder)}>
              {selected.value === folder ? '+'+folder : '-'+folder }
              {selected.value === folder &&
                nav.value[folder].map((fileName) =>
                  <li key={fileName} className="NavItem" onClick={(e)=>handleClick(e, fileName, folder)}>
                    <a className="Item" href="#">
                      {fileName}
                    </a>
                  </li>
                )
              }
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}

function useNav() {
  const [value, setValue] = useState([]);

  useEffect(()=>{
    fetch('/api/getNav')
    .then(res => res.json())
    .then(list => setValue(list));
  },[])

  return {
    value
  };
}

function useSelected() {
  const [value, setValue] = useState('');

  function handleClick(key) {
    if (value === key) setValue(null);
    else setValue(key);
  };

  return {
    value,
    handleClick
  };
}
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
  };

  return (
    <div className="Nav">
      <SearchGroup/>
      <div className="NavList">
        <ul>
          {Object.keys(nav.value).map((db) => 
            <div className="DB" key={db} >
              {selected.displayDB(db)}
              {Object.keys(nav.value[db]).map((folder) => 
                <div className="Folder" key={folder} onClick={()=>selected.handleClick(db, folder)}>
                  {selected.displayFolder(folder)}
                  {selected.folder === folder &&
                    nav.value[db][folder].map((fileName) =>
                      <li key={fileName} className="NavItem" onClick={(e)=>handleClick(e, fileName, folder)}>
                        <a className="Item" href="#">
                          {fileName}
                        </a>
                      </li>
                    )
                  }
                </div>
              )}
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
  },[]);

  return {
    value
  };
}

function useSelected() {
  const [db, setDB] = useState('');
  const [folder, setFolder] = useState('');

  function handleClick(_db, _folder) {
    if (folder === _folder && db === _db) {
      setFolder(null);
      setDB(null);
    } else {
      setDB(_db);
      setFolder(_folder);
    }
  };

  function displayFolder(_folder) {
    return folder === _folder ? '+'+_folder : '-'+_folder;
  }

  function displayDB(_db) {
    return db === _db ? '+'+_db : '-'+_db;
  }

  return {
    db,
    folder,
    handleClick,
    displayDB,
    displayFolder
  };
}
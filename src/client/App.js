import React, { useState } from 'react';
import './app.css';
import Nav from './nav/Nav'
import Main from './Main/Main'

export default function App() {
  const metadata = useMetadata(null);

  return (
    <div className="Wrapper">
      <Nav init={metadata.init}/>
      <Main metadata={metadata}/>
    </div>
  );
}

function useMetadata() {
  const [value, setValue] = useState({});
  const [path, setPath] = useState('');
  const sourceList = useSourceList();
  const audioBuffer = useAudioBuffer();
  const cvTypeList = useCvTypeList();

  function init(_value, _path) {
    _value.link = _value.link || '';
    _value.c.map((t) => {
      t.cv = t.cv || {
        ff : 'PT Sans, sans-serif',
        pl : 0, pr: 0, pt: 0, fs: 0,
        type: ''
      }
    });

    audioBuffer.init(_value.source, _value.file);
    sourceList.init();
    cvTypeList.init(_value.source);

    setValue(_value);
    setPath(_path);
  };

  return {
    value,
    path,
    audioBuffer,
    sourceList,
    cvTypeList,

    init
  };
}

function useAudioBuffer() {
  const [value, setValue] = useState(null);

  function init(source, file) {
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

function useCvTypeList() {
  const [value, setValue] = useState([]);

  function init(source) {
    fetch(`/api/getCanvasType?source=${source}`)
    .then(res => res.json())
    .then(res => { setValue(res); });
  };

  return {
    value,
    init
  }
}
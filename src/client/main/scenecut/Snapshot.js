import React, { useState, useEffect } from 'react';

export default function Snapshot(props) {
    const snapshot = useSnapshot(props.source, props.file, props.time, props.size);

    return (
        <img src={snapshot.value} type="image/jpeg"/>
    );
}

function useSnapshot(source, file, time, size) {
    const [value, setValue] = useState(null);

    useEffect(() => {
        fetch(`/api/getSnapshot?source=${source}
                &name=${encodeURIComponent(file)}&t=${time}
                &size=${size.width}x${size.height}`)
        .then(res => res.blob())
        .then(res => {
          let arrayBuffer = null;
          const fileReader = new FileReader();

          fileReader.onload = function(event) {
            arrayBuffer = event.target.result;
            let src = new Blob([new Uint8Array(arrayBuffer)], {type:"image/jpeg"});

            setValue(window.URL.createObjectURL(src));
          };
          fileReader.readAsArrayBuffer(res);
        });
    }, [source, file, time]);

    return {
        value
    };
}
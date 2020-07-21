import React from 'react';
import './app.css';
import Nav from './nav/Nav'
import Main, { useData }  from './main/Main'

export default function App() {
  const data = useData();

  return (
    <div className="Wrapper">
      <Nav init={data.init} nav={data.nav}/>
      <Main data={data}/>
    </div>
  );
}
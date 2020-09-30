import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// レンダリング
ReactDOM.render(
  // 第一引数はコンポーネントでReact.StrictModeとその中のApp
  // React.StrictModeは「アプリケーションの潜在的な問題点を洗い出すためのツール」とのこと
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  // 第二引数はレンダリング先で#root
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

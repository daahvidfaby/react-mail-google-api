import React from 'react';
import ReactDOM from 'react-dom/client';
import { browserHistory } from 'react-router';
import Routes from './App';

import './index.css';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Routes history={browserHistory} />
);

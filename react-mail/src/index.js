import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from '../node_modules/react-router';
import Routes from './App';

import './index.css';


ReactDOM.render(
  <Routes history={browserHistory} />,
  document.getElementById('root')
);

console.info('contentScript is running')

import React from 'react';
import ReactDOM from 'react-dom';
import OverlayComponent from '../overlay/index';

const initialSystemMessages: string[] = ["Install"]

// Create a container element for rendering the React component
const app = document.createElement('div');
document.body.appendChild(app);

// Render the OverlayComponent using React.createElement
ReactDOM.render(
  React.createElement(OverlayComponent, { initialSystemMessages }), // Equivalent to <OverlayComponent messages={messages} />
  app
);
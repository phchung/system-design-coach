console.info('contentScript is running')

import React from 'react';
import ReactDOM from 'react-dom';
import OverlayComponent from '../overlay/index';

const initialSystemMessages: string[] = ["Install ESLint: If you haven't already installed ESLint globally or as a local dependency in your project, you can do so via npm or yarn:", "Automate with npm scripts: To make linting easier, you can add an npm script in your package.json file:", "Message 3"]; // Example messages

// Create a container element for rendering the React component
const app = document.createElement('div');
document.body.appendChild(app);

// Render the OverlayComponent using React.createElement
ReactDOM.render(
  React.createElement(OverlayComponent, { initialSystemMessages }), // Equivalent to <OverlayComponent messages={messages} />
  app
);
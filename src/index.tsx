import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

import * as serviceWorkerRegistration from './service-worker-registration';
// import reportWebVitals from './Util/report-web-vitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // if (registration.waiting) {
    //   registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    // }
    alert('New update available!');
  },
});
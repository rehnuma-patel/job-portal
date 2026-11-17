import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { JobBoardProvider } from './context/JobBoardContext.jsx';
import './styles.css';

// HashRouter keeps routes working on GitHub Pages (which has no server-side routing)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <JobBoardProvider>
        <App />
      </JobBoardProvider>
    </HashRouter>
  </StrictMode>,
);

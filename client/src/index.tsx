import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';


import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
    <App />
    </ThemeProvider>
  </React.StrictMode>
);


(function _waitModuleAvailable() {
  if (window.Module) {
    const script = document.createElement('script');
    script.src = './chat.js';
    document.body.appendChild(script);
  } else {
    setTimeout(_waitModuleAvailable, 100); // Check again after 100 milliseconds
  }
})()






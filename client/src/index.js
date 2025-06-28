import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store/ReduxStore.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>

      <BrowserRouter>
        <Routes>
          <Route path='*' element= {<App />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
          position="bottom-right" // Position of the toast
          autoClose={5000} // Auto-close after 5 seconds
          hideProgressBar={false} // Show progress bar
          newestOnTop={false} // Older toasts on top
          closeOnClick // Close toast on click
          rtl={false} // Right-to-left support
          pauseOnFocusLoss // Pause when window loses focus
          draggable // Allow dragging to dismiss
          pauseOnHover // Pause on hover
          theme="light" // Theme (light, dark, or colored)
        />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

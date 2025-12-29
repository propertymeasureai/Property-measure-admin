import React, { useState } from 'react';
import EstimationPage from './EstimationPage';
import Toast from './toast';

function App() { 
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => setToastMsg(msg);
  return (
    <>
      <EstimationPage showToast={showToast}/>
      {
        toastMsg && (
          <Toast
            message={toastMsg}
            onClose={() => setToastMsg(null)}
          />
        )
      } 
    </>
  );
}

export default App;
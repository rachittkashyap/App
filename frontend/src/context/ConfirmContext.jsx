import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Modal from '../components/Modal.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, title, confirmLabel, danger }
  const resolveRef = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    setState({ message, ...options });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handleChoice(result) {
    setState(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Modal title={state.title || 'Please confirm'} onClose={() => handleChoice(false)} width={400}>
          <p style={{ marginTop: 0 }}>{state.message}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn secondary" onClick={() => handleChoice(false)}>
              Cancel
            </button>
            <button
              className="btn"
              style={state.danger ? { background: '#dc2626' } : undefined}
              onClick={() => handleChoice(true)}
            >
              {state.confirmLabel || 'Confirm'}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}

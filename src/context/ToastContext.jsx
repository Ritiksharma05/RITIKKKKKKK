import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
    loading: (message) => addToast(message, 'loading'),
  };

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (type !== 'loading') {
      setTimeout(() => removeToast(id), 5000);
    }
    
    return id; // Return ID to allow manual removal for 'loading'
  };

  const dismiss = (id) => removeToast(id);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 items-center pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="pointer-events-auto w-full"
            >
              <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
                <div className="shrink-0">
                  {t.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                  {t.type === 'error' && <XCircle className="text-red-500" size={20} />}
                  {t.type === 'info' && <Info className="text-blue-500" size={20} />}
                  {t.type === 'loading' && <Loader2 className="text-blue-500 animate-spin" size={20} />}
                </div>
                <p className="text-sm font-medium text-white flex-1">{t.message}</p>
                <button 
                  onClick={() => removeToast(t.id)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useCustomToast = () => useContext(ToastContext);

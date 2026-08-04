'use client';

import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#0F172A', color: '#F8FAFC', borderRadius: '12px' },
          success: { iconTheme: { primary: '#D4AF37', secondary: '#0F172A' } },
        }}
      />
    </Provider>
  );
}

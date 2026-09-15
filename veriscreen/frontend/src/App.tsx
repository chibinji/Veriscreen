import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/common/ErrorBoundary';
import { queryClient } from './queryClient';

const App: React.FC = () => {
  const { initializeFromStorage } = useAuthStore();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;

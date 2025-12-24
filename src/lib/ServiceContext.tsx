import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

interface ServiceStatus {
  modelLoaded: boolean;
  modelLoading: boolean;
  databaseConnected: boolean;
  uploadFolderReady: boolean;
}

interface ServiceContextType {
  status: ServiceStatus;
  isHealthy: boolean;
  preloadModel: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ServiceStatus>({
    modelLoaded: false,
    modelLoading: false,
    databaseConnected: false,
    uploadFolderReady: false,
  });
  const [preloadTriggered, setPreloadTriggered] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        const newStatus = {
          modelLoaded: data.model_loaded || false,
          modelLoading: data.model_loading || false,
          databaseConnected: data.database_connected || false,
          uploadFolderReady: data.upload_folder || false,
        };
        setStatus(newStatus);
        
        if (!preloadTriggered && newStatus.databaseConnected && !newStatus.modelLoaded && !newStatus.modelLoading) {
          setPreloadTriggered(true);
          preloadModel().catch(() => {});
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setStatus({
          modelLoaded: false,
          modelLoading: false,
          databaseConnected: false,
          uploadFolderReady: false,
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [preloadTriggered]);

  const preloadModel = async () => {
    try {
      console.log('Preloading AI model in background...');
      await fetch(`${API_BASE_URL}/api/model-status`);
      console.log('Model preload initiated');
    } catch (error) {
      console.error('Model preload failed:', error);
    }
  };

  const isHealthy = status.databaseConnected && status.uploadFolderReady;

  return (
    <ServiceContext.Provider value={{ status, isHealthy, preloadModel }}>
      {children}
    </ServiceContext.Provider>
  );
}

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

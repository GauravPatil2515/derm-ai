import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

interface ServiceStatus {
  modelLoaded: boolean;
  databaseConnected: boolean;
  uploadFolderReady: boolean;
}

interface ServiceContextType {
  status: ServiceStatus;
  isHealthy: boolean;
}

const ServiceContext = createContext<ServiceContextType>({
  status: {
    modelLoaded: false,
    databaseConnected: false,
    uploadFolderReady: false,
  },
  isHealthy: false,
});

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ServiceStatus>({
    modelLoaded: false,
    databaseConnected: false,
    uploadFolderReady: false,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        setStatus({
          modelLoaded: data.model_loaded,
          databaseConnected: data.database_connected,
          uploadFolderReady: data.upload_folder,
        });
      } catch (err) {
        setStatus({
          modelLoaded: false,
          databaseConnected: false,
          uploadFolderReady: false,
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = status.modelLoaded && status.databaseConnected && status.uploadFolderReady;

  return (
    <ServiceContext.Provider value={{ status, isHealthy }}>
      {children}
    </ServiceContext.Provider>
  );
}

export const useService = () => useContext(ServiceContext);
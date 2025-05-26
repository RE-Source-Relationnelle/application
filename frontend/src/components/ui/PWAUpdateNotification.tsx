import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdateNotification: React.FC = () => {
  const [show, setShow] = useState(false);
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh || offlineReady) {
      setShow(true);
    }
  }, [needRefresh, offlineReady]);

  const close = () => {
    setShow(false);
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {needRefresh && (
              <>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Mise à jour disponible
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Une nouvelle version de l'application est disponible.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Mettre à jour
                  </button>
                  <button
                    onClick={close}
                    className="px-3 py-2 text-gray-600 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </>
            )}
            
            {offlineReady && !needRefresh && (
              <>
                <h4 className="font-semibold text-green-900 mb-1">
                  App prête hors ligne
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  L'application est maintenant disponible hors ligne.
                </p>
                <button
                  onClick={close}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Compris
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={close}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification; 
import { useState } from 'react';
import Toast, { ToastType } from './Toast';

const ToastDemo = () => {
  const [visibleToasts, setVisibleToasts] = useState<{
    type: ToastType;
    visible: boolean;
  }[]>([
    { type: 'success', visible: true },
    { type: 'error', visible: true },
    { type: 'info', visible: true },
    { type: 'warning', visible: true },
  ]);

  const handleClose = (index: number) => {
    setVisibleToasts((prev) => {
      const newToasts = [...prev];
      newToasts[index].visible = false;
      return newToasts;
    });
  };

  const resetToasts = () => {
    setVisibleToasts((prev) =>
      prev.map((toast) => ({ ...toast, visible: true }))
    );
  };

  // Messages de démonstration pour chaque type
  const messages = {
    success: 'Votre ressource a été créée avec succès et est en attente de validation par un modérateur.',
    error: 'Une erreur est survenue lors de la création de la ressource. Veuillez réessayer.',
    info: 'Vous avez 3 nouvelles notifications.',
    warning: 'Votre session expirera dans 5 minutes.',
  };

  // Désactiver le timeout automatique pour le design
  const PERMANENT_DURATION = 1000000000; // ~31 ans, pratiquement permanent

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Démonstration des Toasts</h2>
        
        <div className="mb-4">
          <button
            onClick={resetToasts}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
          >
            Réafficher tous les toasts
          </button>
        </div>
        
        <div className="space-y-4">
          {visibleToasts.map((toast, index) => (
            toast.visible && (
              <div key={toast.type} className="relative">
                <Toast
                  message={messages[toast.type]}
                  type={toast.type}
                  duration={PERMANENT_DURATION}
                  onClose={() => handleClose(index)}
                />
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;

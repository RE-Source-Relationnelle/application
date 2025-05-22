import { useToast } from '../../contexts/ToastContext';

const ToastTester = () => {
  const { showToast } = useToast();

  return (
    <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg z-40 border border-gray-200">
      <h3 className="text-sm font-semibold mb-2">Test des Toasts</h3>
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => showToast('Votre ressource a été créée avec succès et est en attente de validation par un modérateur.', 'success')}
          className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
        >
          Toast Succès
        </button>
        <button
          onClick={() => showToast('Une erreur est survenue lors de la création de la ressource. Veuillez réessayer.', 'error')}
          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
        >
          Toast Erreur
        </button>
        <button
          onClick={() => showToast('Vous avez 3 nouvelles notifications.', 'info')}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Toast Info
        </button>
        <button
          onClick={() => showToast('Votre session expirera dans 5 minutes.', 'warning')}
          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
        >
          Toast Avertissement
        </button>
      </div>
    </div>
  );
};

export default ToastTester;

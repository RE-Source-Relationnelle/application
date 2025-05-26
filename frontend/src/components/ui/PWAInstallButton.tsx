import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA installée avec succès');
      }
      
      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation de la PWA:', error);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>App installée</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      <Download size={18} />
      <span>Installer l'app</span>
    </button>
  );
};

export default PWAInstallButton; 
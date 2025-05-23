import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useCategoryStore from '../../store/categoryStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importer les styles CSS de Quill
import '../../styles/quill-custom.css'; // Importer nos styles personnalisés

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: string;
    titre: string;
    contenu: string;
    id_categorie?: string;
  };
  mode: 'create' | 'edit';
  onSubmit: (data: {
    id?: string;
    titre: string;
    contenu: string;
    id_categorie?: string;
  }) => Promise<void>;
}

const ResourceModal = ({ isOpen, onClose, initialData, mode, onSubmit }: ResourceModalProps) => {
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    id_categorie: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();

  // Modules et formats pour l'éditeur Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

  useEffect(() => {
    if (isOpen) {
      // Réinitialiser le formulaire avec les données initiales ou des valeurs par défaut
      setFormData({
        titre: initialData?.titre || '',
        contenu: initialData?.contenu || '',
        id_categorie: initialData?.id_categorie || ''
      });
      
      // Charger les catégories si elles ne sont pas déjà chargées
      if (categories.length === 0) {
        fetchCategories();
      }
      
      // Réinitialiser les erreurs
      setError(null);
    }
  }, [isOpen, initialData, categories.length, fetchCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gestionnaire spécifique pour l'éditeur Quill
  const handleEditorChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      contenu: content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre.trim()) {
      setError('Le titre est requis');
      return;
    }
    
    if (!formData.contenu.trim()) {
      setError('Le contenu est requis');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await onSubmit({
        id: initialData?.id,
        ...formData
      });
      
      // Fermer la modal après soumission réussie
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? 'Créer une ressource' : 'Modifier la ressource'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                placeholder="Titre de la ressource"
                required
              />
            </div>
            
            <div>
              <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu <span className="text-red-500">*</span>
              </label>
              <div className="quill-container">
                <ReactQuill
                  theme="snow"
                  value={formData.contenu}
                  onChange={handleEditorChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Contenu de la ressource"
                  className="h-64 mb-12" // Hauteur fixe avec marge pour la barre d'outils
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="id_categorie" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              {categoriesLoading ? (
                <div className="w-full p-2 border rounded bg-gray-50 text-gray-500">
                  Chargement des catégories...
                </div>
              ) : (
                <select
                  id="id_categorie"
                  name="id_categorie"
                  value={formData.id_categorie}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                >
                  <option value="">Non catégorisé</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.nom}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-primary text-white rounded hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </span>
              ) : (
                mode === 'create' ? 'Publier' : 'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceModal;

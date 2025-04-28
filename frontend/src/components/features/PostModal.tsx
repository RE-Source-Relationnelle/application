import { useState } from 'react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const PostModal = ({ isOpen, onClose, onSubmit }: PostModalProps) => {
  const [postContent, setPostContent] = useState('');

  const handleSubmit = () => {
    if (postContent.trim()) {
      onSubmit(postContent);
      setPostContent('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Créer un post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <h3 className="font-semibold">Votre Nom</h3>
            </div>
          </div>
          
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="De quoi voulez-vous parler ?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          ></textarea>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="flex items-center space-x-2 p-2 rounded-full text-gray-600 hover:bg-gray-100">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Photo</span>
            </button>
            
            <button className="flex items-center space-x-2 p-2 rounded-full text-gray-600 hover:bg-gray-100">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-50 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Vidéo</span>
            </button>
            
            <button className="flex items-center space-x-2 p-2 rounded-full text-gray-600 hover:bg-gray-100">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span>Lien</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={!postContent.trim()}
            className={`px-4 py-2 rounded-full font-medium ${postContent.trim() ? 'bg-primary text-white hover:bg-secondary' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
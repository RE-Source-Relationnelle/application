import { useState } from 'react'
import MainLayout from '../components/layout/MainLayout'
import PostModal from '../components/features/PostModal'

const Feed = () => {
    const [postContent, setPostContent] = useState('')
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)

    const handlePostSubmit = (content: string) => {
        if (content.trim()) {
            // TODO: Implémenter l'envoi du post à l'API
            console.log('Nouveau post:', content)
        }
    }

    const openPostModal = () => {
        setIsPostModalOpen(true);
    }

    const closePostModal = () => {
        setIsPostModalOpen(false);
    }

    return (
        <>
            <MainLayout onOpenPostModal={openPostModal}>
                <div className="w-full mx-auto space-y-4 sm:px-0">
                    {/* Création de post (visible uniquement sur desktop) */}
                    <div className="bg-white rounded-lg shadow p-3 sm:p-4 hidden sm:block">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div 
                                onClick={openPostModal}
                                className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-full text-sm sm:text-base text-gray-500 cursor-pointer"
                            >
                                Commencer un post
                            </div>
                        </div>
                    </div>

                    {/* Séparateur */}
                    <div className="hidden lg:flex items-center space-x-2 px-1 my-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">Publications récentes</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Example post */}
                    <div className="bg-white rounded-lg shadow sm:rounded-lg w-full">
                        {/* En-tête du post */}
                        <div className="p-3 sm:p-4">
                            <div className="flex items-start">
                                <div className="w-12 h-12 rounded-full bg-gray-200 mr-2 sm:mr-3"></div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm sm:text-base">John Doe</h3>
                                    <p className="text-xs text-gray-500">Médecin spécialiste en santé publique</p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <span>Il y a 2 heures</span>
                                        <span className="mx-1">•</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </p>
                                </div>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Contenu du post */}
                        <div className="px-3 sm:px-4 pb-2">
                            <p className="text-sm sm:text-base mb-3">
                                Voici un exemple de post sur notre réseau social dédié au bien-être et à la santé ! Aujourd'hui, j'aimerais partager quelques conseils sur l'importance de l'hydratation pour maintenir une bonne santé.
                            </p>
                            <div className="rounded-md overflow-hidden mb-2">
                                <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Hydratation" className="w-full h-auto" />
                            </div>
                        </div>
                        
                        {/* Statistiques d'engagement */}
                        <div className="px-3 sm:px-4 py-1 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <span>42</span>
                            </div>
                            <div>
                                <span>8 commentaires</span>
                                <span className="mx-1">•</span>
                                <span>3 partages</span>
                            </div>
                        </div>
                        
                        {/* Actions sur le post */}
                        <div className="px-2 py-1 flex justify-between border-t border-gray-200">
                            <button className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span className="text-sm">J'aime</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <span className="text-sm">Commenter</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span className="text-sm">Partager</span>
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
            
            {/* Modal de création de post */}
            <PostModal 
                isOpen={isPostModalOpen} 
                onClose={closePostModal} 
                onSubmit={handlePostSubmit} 
            />
        </>
    )
}

export default Feed
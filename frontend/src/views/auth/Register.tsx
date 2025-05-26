import { useState, FormEvent, useEffect, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { RegisterFormData } from '../../types/types'

const Register = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        nom: '',
        prenom: '',
        mail: '',
        password: '',
        username: '',
        genre: 'non-specifie' // Valeur par défaut
    })
    const [showPassword, setShowPassword] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)
    
    const { register, error, isAuthenticated, loading, clearError } = useAuthStore()
    const navigate = useNavigate()
    
    // Rediriger si déjà authentifié
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/feed')
        }
        
        // Nettoyer les erreurs lors du démontage du composant
        return () => {
            clearError()
        }
    }, [isAuthenticated, navigate, clearError])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        if (!acceptTerms) {
            alert("Vous devez accepter les conditions d'utilisation pour créer un compte.")
            return
        }
        
        try {
            // Appeler l'action d'inscription du store
            await register(formData)
        } catch (err) {
            // L'erreur est déjà gérée dans le store
            console.error('Register error:', err)
        }
    }

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-6 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8">
                <div className='p-6 md:py-12 md:px-24 bg-[#F6F6F6]'>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-marianne">
                            Se créer un compte avec FranceConnect
                        </h2>
                    </div>
                    <div className='mt-6 flex flex-col gap-4'>
                        <img src="/img/logo-france-connect.svg" alt="France Connect" className="w-[200px]" />
                        <a href="https://franceconnect.gouv.fr/franceconnect" target="_blank" rel="noopener noreferrer" className="w-fit border-b border-primary text-primary text-sm font-marianne flex gap-1">Qu'est-ce que FranceConnect ? <img src="/img/Icone-nouvelle_fenetre.svg" alt="Nouvelle fenêtre" className="w-4" /></a>
                    </div>
                    <div className='my-6 flex items-center gap-4'>
                        <div className="w-full border-b border-grayBold"></div>
                        <div className="text-center">OU</div>
                        <div className="w-full border-b border-grayBold"></div>
                    </div>
                    <div>
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-gray-900 font-marianne">
                                Se créer un compte en choisissant un identifiant
                            </h2>
                            <p className="text-grayBold text-sm">Description — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            <span className="text-textLight text-sm font-marianne">Sauf mention contraire, tous les champs sont obligatoires.</span>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4">
                                {/* Nom */}
                                <div>
                                    <label htmlFor="nom" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                        Nom
                                    </label>
                                    <input
                                        id="nom"
                                        name="nom"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={formData.nom}
                                        onChange={handleChange}
                                    />
                                </div>
                                
                                {/* Prénom */}
                                <div>
                                    <label htmlFor="prenom" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                        Prénom
                                    </label>
                                    <input
                                        id="prenom"
                                        name="prenom"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                    />
                                </div>
                                
                                {/* Nom d'utilisateur */}
                                <div>
                                    <label htmlFor="username" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                        Nom d'utilisateur
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                
                                {/* Genre */}
                                <div>
                                    <label htmlFor="genre" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                        Genre
                                    </label>
                                    <select
                                        id="genre"
                                        name="genre"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={formData.genre}
                                        onChange={handleChange}
                                    >
                                        <option value="homme">Homme</option>
                                        <option value="femme">Femme</option>
                                        <option value="non-binaire">Non-binaire</option>
                                        <option value="non-specifie">Je ne souhaite pas préciser</option>
                                    </select>
                                </div>
                                
                                {/* Email */}
                                <div>
                                    <label htmlFor="mail" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                        Email
                                        <span className="text-textLight text-xs mb-2">Format attendu : email@example.com</span>
                                    </label>
                                    <input
                                        id="mail"
                                        name="mail"
                                        type="email"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={formData.mail}
                                        onChange={handleChange}
                                    />
                                </div>
                                
                                {/* Mot de passe */}
                                <div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <label htmlFor="password" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                            Mot de passe
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className='appearance-none w-4 h-4 border border-primary rounded-[4px] focus:outline-none checked:bg-primary'
                                                type="checkbox"
                                                name="showPassword"
                                                id="showPassword"
                                                checked={showPassword}
                                                onChange={() => setShowPassword(!showPassword)} />
                                            <label htmlFor="showPassword" className="text-sm font-medium text-gray-700 leading-none">Afficher</label>
                                        </div>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <div className='mt-2 flex flex-col gap-2'>
                                        <span className="text-textLight text-xs font-marianne">Votre mot de passe doit contenir au moins :</span>
                                        <ul className="space-y-1">
                                            <li className='flex items-center gap-2'>
                                                <img src="/img/icon-info.svg" alt="Information" className="w-4 h-4" />
                                                <span className='text-[#0063CB] text-sm'>12 caractères minimum</span>
                                            </li>
                                            <li className='flex items-center gap-2'>
                                                <img src="/img/icon-info.svg" alt="Information" className="w-4 h-4" />
                                                <span className='text-[#0063CB] text-sm'>1 caractère spécial</span>
                                            </li>
                                            <li className='flex items-center gap-2'>
                                                <img src="/img/icon-info.svg" alt="Information" className="w-4 h-4" />
                                                <span className='text-[#0063CB] text-sm'>1 chiffre minimum</span>
                                            </li>
                                        </ul>
                                        <a href="https://www.cnil.fr/fr/authentification-par-mot-de-passe-les-mesures-de-securite-elementaires" target="_blank" rel="noopener noreferrer" className="w-fit underline text-primary text-xs font-marianne flex gap-1">Lire les recommandations de la Commission Nationale de l'Informatique et des Libertés (CNIL)<img src="/img/Icone-nouvelle_fenetre.svg" alt="Nouvelle fenêtre" className="w-4" /></a>

                                        <div className="mt-4 flex items-center gap-2">
                                            <input 
                                                className='appearance-none w-4 h-4 border border-primary rounded-[4px] focus:outline-none checked:bg-primary' 
                                                type="checkbox"
                                                id="acceptTerms"
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                            />
                                            <label htmlFor="acceptTerms" className="text-sm font-medium text-gray-700 leading-none">J'accepte les  <a href="https://www.service-public.fr/P10050" target="_blank" rel="noopener noreferrer" className="underline text-sm font-marianne">conditions générales d'utilisation</a></label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className='mt-6 flex flex-col items-end justify-center gap-2'>
                                <button
                                    type="submit"
                                    className="py-2 px-6 text-sm text-white bg-primary hover:bg-secondary rounded-md"
                                    disabled={loading}
                                >
                                    {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                                </button>
                                <span className="text-sm text-grayBold font-marianne">Déjà un compte ? <a href="/" className="text-primary underline">Se connecter</a></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
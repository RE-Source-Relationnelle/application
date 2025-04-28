import { useState, FormEvent } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // TODO: Implémenter la logique de connexion avec l'API
      console.log('Login attempt with:', { email, password })
    } catch (err) {
      setError('Échec de la connexion. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-6 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8 bg-white">
                <div className='p-6 md:py-12 md:px-24 bg-[#F6F6F6]'>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 font-marianne">
                            Connexion à (Re)sources relationnelles
                        </h1>
                        <h2 className="text-lg font-bold text-gray-900 font-marianne mt-4">Se connecter avec FranceConnect</h2>
                        <p className="text-grayBold text-sm mt-2">FranceConnect est la solution proposée par l’État pour sécuriser et simplifier la connexion aux services en ligne.</p>
                    </div>
                    <div className='mt-6 flex flex-col gap-4'>
                        <img src="/img/logo-france-connect.svg" alt="France Connect" className="w-[200px]" />
                        <a href="https://franceconnect.gouv.fr/franceconnect" target="_blank" rel="noopener noreferrer" className="w-fit border-b border-primary text-primary text-sm font-marianne flex gap-1">Qu’est-ce que FranceConnect ? <img src="/img/Icone-nouvelle_fenetre.svg" alt="Nouvelle fenêtre" className="w-4" /></a>
                    </div>
                    <div className='my-6 flex items-center gap-4'>
                        <div className="w-full border-b border-grayBold"></div>
                        <div className="text-center">OU</div>
                        <div className="w-full border-b border-grayBold"></div>
                    </div>
                    <div>
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-gray-900 font-marianne">
                                Se connecter avec son compte
                            </h2>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="email" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                        Identifiant
                                        <span className="text-textLight text-xs mb-2">Format attendu : email@example.com</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#EEEEEE] border-b-2 border-grayBold placeholder-gray-500 text-gray-900 rounded-t-sm focus:outline-secondary focus:border-secondary sm:text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className='mt-2 flex flex-col gap-2'>
                                        <a href="#" target="_blank" rel="noopener noreferrer" className="w-fit underline text-primary text-xs font-marianne flex gap-1">Mot de passe oublié ?</a>

                                        <div className="mt-4 flex items-center gap-2">
                                            <input className='appearance-none w-4 h-4 border border-primary rounded-[4px] focus:outline-none checked:bg-primary' type="checkbox"/>
                                            <label htmlFor="showPassword" className="text-sm font-medium text-gray-700 leading-none">Se souvenir de moi</label>
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
                                    className="py-2 px-6 text-sm text-white bg-primary hover:bg-secondary"
                                >
                                    Se connecter
                                </button>
                                <span className="text-sm text-grayBold font-marianne">Pas encore de compte ? <a href="/inscription" className="text-primary underline">S'inscrire</a></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default Login
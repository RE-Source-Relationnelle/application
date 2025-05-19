import { useState, FormEvent } from 'react'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            // TODO: Implémenter la logique de récupération de mot de passe avec l'API
            console.log('Forgot password attempt with:', { email })
        } catch (err) {
            setError('Échec de la connexion. Veuillez réessayer.')
        }
    }

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-6 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8 bg-white">
                <h1 className="text-2xl font-bold text-gray-900 font-marianne">Récupération de mot de passe sur (Re)sources relationnelles</h1>
                <p className="text-grayBold text-sm">Chapô — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Platea ornare cras eget vitae volutpat in auctor turpis. Eget nibh risus ac orci sit elementum vitae, habitasse viverra.</p>
                <div className='p-6 md:py-12 md:px-24 bg-[#F6F6F6]'>
                    <div>
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-gray-900 font-marianne">
                                Récupérer le mot de passe de votre compte   
                            </h2>
                            <p className="text-grayBold text-sm">Description — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
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
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
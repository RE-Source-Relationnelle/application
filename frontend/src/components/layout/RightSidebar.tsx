export default function RightSidebar() {
    return (
      <div className="bg-white rounded-lg shadow p-4 sticky top-20">
        <h3 className="font-semibold mb-4">Suggestions</h3>
        
        {/* Liste des suggestions */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div>
                <h4 className="font-medium">Utilisateur {i}</h4>
                <p className="text-sm text-gray-500">Expert en santé mentale</p>
              </div>
            </div>
          ))}
        </div>
  
        {/* Tendances */}
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Tendances</h3>
          <div className="space-y-2">
            {['Santé', 'Famille', 'Bien-être'].map((tag) => (
              <div key={tag} className="text-sm text-blue-600 hover:underline cursor-pointer">
                #{tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
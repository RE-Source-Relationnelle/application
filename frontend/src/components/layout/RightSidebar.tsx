export default function RightSidebar() {
    return (
      <div className="bg-white rounded-lg ring-gray-200 ring-1 p-4">
        <h3 className="font-semibold mb-4">Catégories</h3>
        
        {/* Liste des suggestions */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div>
                <h4 className="font-medium">Catégorie {i}</h4>
                <p className="text-sm text-gray-500">Description de la catégorie {i}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
export default function LeftSidebar() {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        {/* Profil rapide */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div>
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-sm text-gray-500">Voir le profil</p>
          </div>
        </div>
      </div>
    )
  }
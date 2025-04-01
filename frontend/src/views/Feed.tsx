import MainLayout from '../components/layout/MainLayout'

const Feed = () => {
  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Example post */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div>
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm text-gray-500">Il y a 2 heures</p>
            </div>
          </div>
          <p className="mb-4">
            Voici un exemple de post sur notre réseau social dédié au bien-être et à la santé !
          </p>
          <div className="flex items-center space-x-4 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-blue-600">
              <span>👍</span>
              <span>J'aime</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-600">
              <span>💬</span>
              <span>Commenter</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-600">
              <span>↗️</span>
              <span>Partager</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Feed
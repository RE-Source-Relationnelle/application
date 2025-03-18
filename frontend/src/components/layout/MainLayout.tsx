import Navbar from './Navbar'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-4 pt-20">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar Gauche */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftSidebar />
          </div>
          
          {/* Contenu Principal */}
          <main className="col-span-12 lg:col-span-6">
            {children}
          </main>
          
          {/* Sidebar Droite */}
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
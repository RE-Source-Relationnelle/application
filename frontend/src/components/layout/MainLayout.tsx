import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="container mx-auto px-6 py-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="hidden lg:block lg:col-span-3">
          <LeftSidebar />
        </div>
        <main className="col-span-12 lg:col-span-6">
          {children}
        </main>
        <div className="hidden lg:block lg:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import MobileNavigation from './MobileNavigation'

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenPostModal: () => void;
}

export default function MainLayout({ children, onOpenPostModal }: MainLayoutProps) {
  return (
    <>
      <div className="container mx-auto px-0 sm:px-6 py-4 pb-16 sm:pb-4">
        <div className="grid grid-cols-12 gap-0 sm:gap-4">
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
        <MobileNavigation onOpenPostModal={onOpenPostModal} />
      </div>
    </>
  )
}
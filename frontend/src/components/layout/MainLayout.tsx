import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import MobileNavigation from './MobileNavigation'

interface MainLayoutProps {
  children: React.ReactNode;
  onOpenPostModal: () => void;
  showSidebars?: boolean; 
}

export default function MainLayout({ children, onOpenPostModal, showSidebars = false }: MainLayoutProps) {
  return (
    <>
      <div className="container mx-auto px-2 sm:px-0 pt-4 md:pt-12 pb-16 sm:pb-4">
        <div className="grid grid-cols-12 gap-0 sm:gap-4">
          {showSidebars && (
            <div className="hidden lg:block lg:col-span-3">
              <LeftSidebar />
            </div>
          )}
          <main className={`col-span-12 ${showSidebars ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            {children}
          </main>
          {showSidebars && (
            <div className="hidden lg:block lg:col-span-3">
              <RightSidebar />
            </div>
          )}
        </div>
        <MobileNavigation onOpenPostModal={onOpenPostModal} />
      </div>
    </>
  )
}
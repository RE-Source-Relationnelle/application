import Navbar from './Navbar'
import Footer from './Footer'

interface BaseLayoutProps {
    children: React.ReactNode
}

export default function BaseLayout({ children }: BaseLayoutProps) {
    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="min-h-[calc(100vh-120px)]">
                {children}
            </div>
            <Footer />
        </div>
    )
}
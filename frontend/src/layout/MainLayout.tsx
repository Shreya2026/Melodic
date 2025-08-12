
import { Outlet } from 'react-router-dom'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import LeftSidebar from './components/LeftSidebar';
import FriendsActivity from './components/FriendsActivity';
import AudioPlayer from './components/AudioPlayer';
import { PlaybackControls } from './components/PlaybackControls';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainLayout = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const isSmallScreen = window.innerWidth < 1024; // lg breakpoint - for mobile layout
            const canShowRightPanel = window.innerWidth >= 1280; // xl breakpoint - for right panel
            setIsMobile(isSmallScreen);
            setShowRightPanel(canShowRightPanel);
            
            // Close mobile sidebar if screen becomes large
            if (!isSmallScreen && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
  return (
    <div className='h-screen bg-black text-white flex flex-col'>
        {/* Mobile Header with Hamburger Menu */}
        {isMobile && (
            <div className='flex items-center justify-between p-4 bg-zinc-900 lg:hidden'>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className='text-white hover:bg-zinc-800'
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
                <h1 className='text-lg font-semibold'>Melodic</h1>
                <div className='w-10'></div> {/* Spacer for centering */}
            </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && isSidebarOpen && (
            <>
                <div 
                    className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                    onClick={closeSidebar}
                />
                <div className='fixed left-0 top-0 h-full w-80 bg-black z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto'>
                    <div className='p-4 border-b border-zinc-800 flex items-center justify-between'>
                        <h2 className='text-lg font-semibold'>Menu</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={closeSidebar}
                            className='text-white hover:bg-zinc-800'
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className='flex-1 mobile-sidebar'>
                        <LeftSidebar onItemClick={closeSidebar} />
                    </div>
                </div>
            </>
        )}

        <ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
          <AudioPlayer />
        
        {/* Left Sidebar - Hidden on mobile when closed */}
        {!isMobile && (
            <>
                <ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
                    <LeftSidebar onItemClick={closeSidebar} />
                </ResizablePanel>
                <ResizableHandle className='w-2 bg-black rounded-lg transitions-colors' />
            </>
        )}
        
        {/* Main Content */}
        <ResizablePanel defaultSize={isMobile ? 100 : (showRightPanel ? 60 : 80)}>
            <Outlet />
        </ResizablePanel>

        {/* Right Side bar - Hidden on mobile and tablet */}
        {showRightPanel && (
            <>
                <ResizableHandle className='w-2 bg-black rounded-lg transitions-colors' />
                <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
                    <FriendsActivity /> 
                </ResizablePanel>
            </>
        )}

        </ResizablePanelGroup> 
        <PlaybackControls />
      
    </div>
  )
}

export default MainLayout

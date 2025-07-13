import React from 'react'
import { Outlet } from 'react-router-dom'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import LeftSidebar from './components/LeftSidebar';
import FriendsActivity from './components/FriendsActivity';
import AudioPlayer from './components/AudioPlayer';
import { PlaybackControls } from './components/PlaybackControls';

const MainLayout = () => {

    const isMobile=false;
  return (
    <div className='h-screen bg-black text-white flex flex-col'>
        <ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
          <AudioPlayer />
        {/* Left Sidebar     */}
        <ResizablePanel defaultSize={20} minSize={isMobile?0:10} maxSize={30}>
            <LeftSidebar />
        </ResizablePanel>
        <ResizableHandle className='w-2 bg-black rounded-lg transitions-colors' />
        
        {/* Main Content */}
        <ResizablePanel defaultSize={isMobile?80:60}>
            <Outlet />
        </ResizablePanel>

        <ResizableHandle className='w-2 bg-black rounded-lg transitions-colors' />

        {/* Right Side bar */}
        <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
          <FriendsActivity /> 
           </ResizablePanel>

        </ResizablePanelGroup> 
        <PlaybackControls />
      
    </div>
  )
}

export default MainLayout

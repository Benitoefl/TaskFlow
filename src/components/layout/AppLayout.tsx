import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Board, Profile } from '../../types/database'

export interface AppLayoutProps {
  boards?: Board[]
  userProfile?: Profile | null
  boardTitle?: string
  isRealtimeConnected?: boolean
  onOpenShareModal?: () => void
  onOpenCreateBoard?: () => void
  onSignOut: () => Promise<void>
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  boards = [],
  userProfile,
  boardTitle,
  isRealtimeConnected = true,
  onOpenShareModal,
  onOpenCreateBoard,
  onSignOut,
}) => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false)

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar
        boards={boards}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        onOpenCreateBoard={onOpenCreateBoard}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar
          onToggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          userProfile={userProfile}
          boardTitle={boardTitle}
          isRealtimeConnected={isRealtimeConnected}
          onOpenShareModal={onOpenShareModal}
          onSignOut={onSignOut}
        />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Database,
  PieChart
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: 'Overview',
      roles: ['agent', 'supervisor', 'manager']
    },
    {
      path: '/hosting-plans',
      icon: Database,
      label: 'Hosting Plans',
      roles: ['agent', 'supervisor', 'manager']
    },
    {
      path: '/user-management',
      icon: Users,
      label: 'User Management',
      roles: ['supervisor', 'manager']
    },
    {
      path: '/reports',
      icon: PieChart,
      label: 'Reports',
      roles: ['supervisor', 'manager']
    }
  ]

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(profile?.role || 'agent')
  )

  return (
    <div className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">MRR Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          {profile?.name || profile?.email}
        </p>
        <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded mt-2 capitalize">
          {profile?.role}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

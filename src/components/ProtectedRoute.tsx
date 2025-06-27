
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['agent', 'supervisor', 'manager'] 
}) => {
  const { user, profile, loading } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user, 'profile:', !!profile)

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Auth timeout reached, stopping loading state')
      setTimeoutReached(true)
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [])

  // If we've been loading too long, treat as if not authenticated
  if (timeoutReached && loading) {
    console.log('Timeout reached while loading, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
          <p className="text-sm text-gray-400 mt-2">If this takes too long, you'll be redirected to login</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Allow access if user exists, even without profile (in case of network issues)
  if (user && !profile) {
    console.log('User exists but no profile loaded - allowing access with default role')
    return <>{children}</>
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

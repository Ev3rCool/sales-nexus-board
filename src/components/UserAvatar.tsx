import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface UserAvatarProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { profile } = useAuth()
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-16 w-16'
  }

  const getInitials = () => {
    const firstName = profile?.first_name || ''
    const lastName = profile?.last_name || ''
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase()
    }
    
    if (profile?.name) {
      const parts = profile.name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return parts[0].slice(0, 2).toUpperCase()
    }
    
    return profile?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {profile?.avatar_url && (
        <AvatarImage 
          src={profile.avatar_url} 
          alt={`${profile?.first_name || profile?.name || 'User'}'s avatar`}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary border border-primary/20">
        {profile ? getInitials() : <UserRound className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
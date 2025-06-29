
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    // Set a maximum loading time to prevent infinite loading
    const maxLoadingTime = 10000 // 10 seconds
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('Auth loading timeout reached, setting loading to false')
        setLoading(false)
      }
    }, maxLoadingTime)

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        console.log('Session:', session?.user?.email || 'No session')
        
        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              await fetchOrCreateProfile(session.user)
            } catch (profileError) {
              console.error('Profile fetch/create failed:', profileError)
              // Continue without profile - user can still access the app
            }
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user')
      
      if (mounted) {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            await fetchOrCreateProfile(session.user)
          } catch (profileError) {
            console.error('Profile fetch/create failed during auth change:', profileError)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [])

  const fetchOrCreateProfile = async (user: User) => {
    try {
      console.log('Fetching profile for user:', user.id)
      
      // First try to fetch existing profile
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        throw error
      }

      if (data) {
        console.log('Profile found:', data)
        setProfile(data)
      } else {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new profile...')
        
        const newProfile = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || null,
          role: 'agent' as const
        }

        const { data: createdProfile, error: insertError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
          throw insertError
        }

        console.log('Profile created successfully:', createdProfile)
        setProfile(createdProfile)
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

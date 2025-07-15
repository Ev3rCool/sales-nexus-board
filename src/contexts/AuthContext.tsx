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

    console.log('🔍 AuthProvider: Initializing authentication...')

    // Set a maximum loading time to prevent infinite loading
    const maxLoadingTime = 8000 // 8 seconds
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ AuthProvider: Timeout reached, setting loading to false')
        setLoading(false)
      }
    }, maxLoadingTime)

    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Getting initial session...')
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ AuthProvider: Session error:', sessionError)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        console.log('✅ AuthProvider: Session retrieved:', session?.user?.email || 'No session')
        
        if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              await fetchOrCreateProfile(session.user)
            } catch (profileError) {
              console.error('❌ AuthProvider: Profile fetch/create failed:', profileError)
              // Continue without profile - user can still access the app
            }
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ AuthProvider: Auth initialization error:', error)
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
      console.log('🔄 AuthProvider: Auth state changed:', event, session?.user?.email || 'No user')
      
      if (mounted) {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            await fetchOrCreateProfile(session.user)
          } catch (profileError) {
            console.error('❌ AuthProvider: Profile fetch/create failed during auth change:', profileError)
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
      console.log('🔍 AuthProvider: Fetching profile for user:', user.id)
      console.log('🔍 AuthProvider: User details:', { email: user.email, metadata: user.user_metadata, raw_user_meta_data: (user as any).raw_user_meta_data })
      
      // First try to fetch existing profile
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      console.log('🔍 AuthProvider: Profile query result:', { data, error })

      if (error) {
        console.error('❌ AuthProvider: Error fetching profile:', error)
        throw error
      }

      if (data) {
        console.log('✅ AuthProvider: Profile found and setting:', data)
        setProfile(data)
        console.log('✅ AuthProvider: Profile state updated successfully')
      } else {
        // Profile doesn't exist, create it
        console.log('🔍 AuthProvider: Profile not found, creating new profile...')
        
        const newProfile = {
          id: user.id,
          email: user.email!,
          name: (user as any).raw_user_meta_data?.name || user.email?.split('@')[0] || null,
          role: 'agent' as const
        }

        console.log('🔍 AuthProvider: Creating profile with data:', newProfile)

        const { data: createdProfile, error: insertError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single()

        console.log('🔍 AuthProvider: Profile creation result:', { createdProfile, insertError })

        if (insertError) {
          console.error('❌ AuthProvider: Error creating profile:', insertError)
          throw insertError
        }

        console.log('✅ AuthProvider: Profile created successfully:', createdProfile)
        setProfile(createdProfile)
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error in fetchOrCreateProfile:', error)
      console.error('❌ AuthProvider: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔍 AuthProvider: Signing in user:', email)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('❌ AuthProvider: Sign in error:', error)
      throw error
    }
    console.log('✅ AuthProvider: Sign in successful')
  }

  const signUp = async (email: string, password: string, name: string) => {
    console.log('🔍 AuthProvider: Signing up user:', email)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    if (error) {
      console.error('❌ AuthProvider: Sign up error:', error)
      throw error
    }
    console.log('✅ AuthProvider: Sign up successful')
  }

  const signOut = async () => {
    console.log('🔍 AuthProvider: Signing out user')
    
    // Clear local state immediately
    setUser(null)
    setProfile(null)
    setLoading(false)
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ AuthProvider: Sign out error:', error)
      throw error
    }
    console.log('✅ AuthProvider: Sign out successful')
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
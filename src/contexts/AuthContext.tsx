
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

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        console.log('Initial session:', session?.user?.email)
        
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            // Try to fetch profile, but don't let it block the app
            try {
              await fetchProfile(session.user.id)
            } catch (profileError) {
              console.error('Profile fetch failed, but continuing:', profileError)
              // Continue without profile - user can still use the app
              setLoading(false)
            }
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          // Try to fetch profile, but don't block on errors
          try {
            await fetchProfile(session.user.id)
          } catch (profileError) {
            console.error('Profile fetch failed during auth change:', profileError)
            setLoading(false)
          }
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If user doesn't exist in users table, try to create them
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating new profile...')
          try {
            const { data: userData } = await supabase.auth.getUser()
            if (userData.user) {
              const { data: newProfile, error: insertError } = await supabase
                .from('users')
                .insert({
                  id: userData.user.id,
                  email: userData.user.email!,
                  name: userData.user.user_metadata?.name || null,
                  role: 'agent'
                })
                .select()
                .single()

              if (insertError) {
                console.error('Error creating profile:', insertError)
                throw insertError
              } else {
                console.log('Profile created successfully:', newProfile)
                setProfile(newProfile)
                setLoading(false)
              }
            } else {
              throw new Error('No user data available for profile creation')
            }
          } catch (createError) {
            console.error('Failed to create user profile:', createError)
            throw createError
          }
        } else {
          // For other database errors, throw to be handled by caller
          throw error
        }
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      throw error // Re-throw so caller can handle it
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
        },
        emailRedirectTo: `${window.location.origin}/`
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

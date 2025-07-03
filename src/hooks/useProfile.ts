import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  email?: string
  country?: string
  avatar_url?: string
}

export const useProfile = () => {
  const { profile, user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user?.id) {
      throw new Error('No user found')
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      })

      // Refresh the profile data
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user?.id) {
      throw new Error('No user found')
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be a JPEG, PNG, or WebP image')
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Delete existing avatar if it exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setUploading(false)
    }
  }

  return {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
  }
}
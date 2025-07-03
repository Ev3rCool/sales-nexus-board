import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserAvatar } from '@/components/UserAvatar'
import { useProfile } from '@/hooks/useProfile'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  country: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Finland',
  'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia', 'Croatia',
  'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Malta', 'Luxembourg',
  'Estonia', 'Latvia', 'Lithuania', 'Japan', 'South Korea', 'Singapore',
  'New Zealand', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
  'India', 'China', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines',
  'Vietnam', 'Taiwan', 'Hong Kong', 'South Africa', 'Israel', 'Turkey',
  'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Kenya', 'Nigeria',
  'Morocco', 'Tunisia', 'Russia', 'Ukraine', 'Belarus', 'Serbia',
  'Montenegro', 'Bosnia and Herzegovina', 'North Macedonia', 'Albania',
  'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan'
].sort()

export const ProfilePage: React.FC = () => {
  const { profile, loading, uploading, updateProfile, uploadAvatar } = useProfile()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      country: profile?.country || '',
    },
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const avatarUrl = await uploadAvatar(file)
      
      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl })
    } catch (error) {
      console.error('Avatar upload failed:', error)
      setAvatarPreview(null)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data)
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Profile Picture</CardTitle>
          <CardDescription className="text-gray-400">
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar size="lg" />
              {(uploading || avatarPreview) && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  {uploading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="bg-primary hover:bg-primary/90"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Avatar
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400">
                JPG, PNG or WebP. Max size 5MB.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
          <CardDescription className="text-gray-400">
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-black/20 border-white/10 text-white"
                          placeholder="Enter your first name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-black/20 border-white/10 text-white"
                          placeholder="Enter your last name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="Enter your email address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900 border-white/10">
                        {countries.map((country) => (
                          <SelectItem 
                            key={country} 
                            value={country}
                            className="text-white hover:bg-white/10"
                          >
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
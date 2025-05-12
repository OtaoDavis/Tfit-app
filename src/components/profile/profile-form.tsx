
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, UserCircle, Mail, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Assuming auth is exported from firebase config

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional().nullable(),
  dob: z.string().optional().nullable(), // Date of birth - consider using a date picker
  avatarUrl: z.string().url({ message: "Invalid URL for avatar."}).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get the logged-in user
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      dob: '',
      avatarUrl: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || '',
        email: user.email || '',
        // Bio and DOB are not standard Firebase Auth fields,
        // they would typically come from a Firestore document associated with the user.
        // For now, we'll leave them as potentially empty or load them if you have them elsewhere.
        bio: '', // Placeholder: Load from Firestore if available
        dob: '', // Placeholder: Load from Firestore if available
        avatarUrl: user.photoURL || null,
      });
      setAvatarPreview(user.photoURL || null);
    }
  }, [user, form]);


  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically send the data to your backend/Firestore
      // and update Firebase Auth profile if name or avatarUrl changed.

      const profileUpdates: { displayName?: string; photoURL?: string } = {};
      if (data.name && data.name !== user.displayName) {
        profileUpdates.displayName = data.name;
      }
      // If avatarUrl is a data URI (new upload), you'd first upload to Firebase Storage,
      // then get the download URL to update photoURL.
      // For simplicity, if it's a new data URI, we're not handling the upload here.
      // If it's an existing URL and changed, update it.
      if (data.avatarUrl && data.avatarUrl !== user.photoURL && !data.avatarUrl.startsWith('data:')) {
         profileUpdates.photoURL = data.avatarUrl;
      } else if (data.avatarUrl && data.avatarUrl.startsWith('data:')) {
        // This is a new image uploaded by the user (base64 data URI)
        // TODO: Implement image upload to Firebase Storage
        // For now, we'll just show a toast message that this part is not fully implemented.
        toast({
          title: "Avatar Upload",
          description: "Avatar upload to storage is not yet implemented. For now, only URL updates are saved to Firebase Auth.",
          variant: "default",
        });
        // If you were to implement it:
        // 1. Upload data.avatarUrl (base64) to Firebase Storage
        // 2. Get the download URL from Storage
        // 3. Set profileUpdates.photoURL = downloadURL
      }


      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(auth.currentUser!, profileUpdates);
      }
      
      // Logic to save bio, dob to Firestore would go here.
      // e.g., await updateUserDocument(user.uid, { bio: data.bio, dob: data.dob });

      console.log('Profile data submitted:', data);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully saved.",
        variant: "default", 
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        form.setValue('avatarUrl', result, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> Edit Your Profile
        </CardTitle>
        <CardDescription>Make changes to your personal information here. Click save when you&apos;re done.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center sm:flex-row sm:items-end gap-4">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-primary shadow-md">
                    <AvatarImage src={avatarPreview || undefined} alt={form.getValues("name")} data-ai-hint="person avatar"/>
                    <AvatarFallback className="text-3xl">
                      {form.getValues("name")?.substring(0,1).toUpperCase() || <UserCircle className="h-16 w-16"/>}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        <Camera className="mr-2 h-4 w-4" /> Change Photo
                      </Button>
                    </Label>
                    <Input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                      />
                    <FormDescription className="text-center sm:text-left">
                      JPG, GIF or PNG. 1MB max.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name" className="flex items-center gap-1"><UserCircle className="h-4 w-4 text-muted-foreground"/>Full Name</FormLabel>
                  <FormControl>
                    <Input id="name" placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email" className="flex items-center gap-1"><Mail className="h-4 w-4 text-muted-foreground"/>Email Address</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" placeholder="your@email.com" {...field} readOnly={!!user} />
                  </FormControl>
                  <FormDescription>Email cannot be changed here.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="dob" className="flex items-center gap-1"><CalendarDays className="h-4 w-4 text-muted-foreground"/>Date of Birth</FormLabel>
                  <FormControl>
                    <Input id="dob" type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="bio">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    You can <span>@mention</span> other users and organizations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

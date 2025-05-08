"use client";

import React from 'react';
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

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
  dob: z.string().optional(), // Date of birth - consider using a date picker
  avatarUrl: z.string().url({ message: "Invalid URL for avatar."}).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Mock current user data
const currentUser: ProfileFormValues = {
  name: 'Current User',
  email: 'user@example.com',
  bio: 'Fitness enthusiast and lifelong learner.',
  dob: '1990-01-01',
  avatarUrl: 'https://picsum.photos/seed/currentuser/200/200',
};

export function ProfileForm() {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(currentUser.avatarUrl || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: currentUser,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    console.log('Profile data submitted:', data);
    // Here you would typically send the data to your backend
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully saved.",
      variant: "default", 
    });
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        form.setValue('avatarUrl', reader.result as string, { shouldValidate: true }); // Also update form value
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
                      {form.getValues("name")?.substring(0,1).toUpperCase() || <UserCircle />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <FormLabel htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        <Camera className="mr-2 h-4 w-4" /> Change Photo
                      </Button>
                    </FormLabel>
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
                    <Input id="email" type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
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
                    <Input id="dob" type="date" {...field} />
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

'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ImageUpload from '@/components/ImageUpload';
import UploadDialog from '@/components/UploadDialog';

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  bio: z.string().max(160).min(4, { message: "Bio must be between 4 and 160 characters." }),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export default function ProfileSettings() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    location: "",
    image: "",
  });

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile,
  });

  useEffect(() => {
    if (session) {
      fetch('/api/settings/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          form.reset(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to load profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile settings",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [session, form, toast]);

  const updateProfile = async (data) => {
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      setProfile(data);
      toast.success({
        title: "Profile updated",
        description: "Successfully updated profile"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (imageUrl) => {
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!res.ok) throw new Error();

      setProfile(prev => ({ ...prev, image: imageUrl }));
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  const handleSubmit = (data) => {
    updateProfile(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Picture</h3>
        <div className="flex items-center gap-4">
          {profile.image && (
            <div className="relative w-20 h-20">
              <Image
                src={profile.image}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
          )}
          <Button onClick={() => setShowUploadDialog(true)}>
            Change Picture
          </Button>
        </div>
      </div>

      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleImageUpload}
        currentImage={profile.image}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
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
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update Profile</Button>
        </form>
      </Form>
    </div>
  );
}
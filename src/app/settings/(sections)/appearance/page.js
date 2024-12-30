'use client';

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card , CardContent} from "@/components/ui/card";

const appearanceFormSchema = z.object({
  theme: z.string().min(1, { message: "Theme is required." }),
  chatBackground: z.string().min(1, { message: "Chat background is required." }),
});

const chatBackgroundImages = [
  "/backgroundimages/1.jpeg",
  "/backgroundimages/2.jpg",
  "/backgroundimages/3.jpg",
  "/backgroundimages/4.jpeg",
  "/backgroundimages/5.jpg",
  // Add more image URLs as needed
];

export default function AppearanceSettings() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const {theme , setTheme} = useTheme();
  const [appearance, setAppearance] = useState({
    theme: "",
    chatBackground: "",
  });

  const form = useForm({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: appearance,
  });

  useEffect(() => {
    if (session) {
      fetch('/api/settings/appearance')
        .then(res => res.json())
        .then(data => {
          setAppearance(data);
          form.reset(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to load appearance settings:', error);
          toast({
            title: "Error",
            description: "Failed to load appearance settings",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [session, form, toast]);

  const updateAppearance = async (data) => {
    try {
      const res = await fetch("/api/settings/appearance", {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      setAppearance(data);
      setTheme(data.theme);
      toast({
        title: "Appearance updated",
        description: "Successfully updated appearance settings"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appearance settings",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (data) => {
    updateAppearance(data);
  };

  const handleChatBackgroundSelect = (url) => {
    form.setValue("chatBackground", url);
    updateAppearance({ ...appearance, chatBackground: url });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appearance Settings</h2>
        <p className="text-muted-foreground">
          Customize the appearance of your web application and chat background
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chatBackground"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chat Background</FormLabel>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-32 bg-cover bg-center" style={{ backgroundImage: `url(${field.value})` }} />
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline">Change</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle className="text-center">Select Chat Background</DrawerTitle>
                      </DrawerHeader>
                      <Carousel>
                        <CarouselContent>
                          {chatBackgroundImages.map((url, index) => (
                            <CarouselItem key={index}>
                              <div className="flex justify-center ">

                                <Card className="aspect-square h-48 w-48 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }}>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                <Button className="mt-2 " onClick={() => handleChatBackgroundSelect(url)}>Select</Button>
                                </CardContent>
                                </Card>
                              
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                      </Carousel>
                    </div>
                    </DrawerContent>
                  </Drawer>
                </div>
                <FormDescription>
                  You can customize the chat background. Enter a URL to an image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update Appearance</Button>
        </form>
      </Form>
    </div>
  );
}
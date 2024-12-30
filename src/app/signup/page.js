'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn } from "next-auth/react";
import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SetUsernameDialog from '@/components/set-username-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { handleSubmit, register, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(`/${session.user.username}`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const emailCheck = await fetch(`/api/check-email?email=${data.email}`);
      const emailResult = await emailCheck.json();

      if (!emailResult.available) {
        setErrorMessage('Email already registered');
        setShowEmailError(true);
        return;
      }

      setRegistrationData(data);
      setShowUsernameDialog(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('An unexpected error occurred');
      setShowEmailError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameSubmit = async (username) => {
    if (isSubmitting || !registrationData) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registrationData,
          username
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowUsernameDialog(false);
        // Attempt to sign in automatically
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: registrationData.email,
          password: registrationData.password,
        });

        if (signInResult?.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        handleRegistrationError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      handleRegistrationError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorDismiss = () => {
    setShowError(false);
    setErrorMessage('');
    // Optional: Navigate or reset form state
  };

  const handleRegistrationError = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleEmailErrorDismiss = () => {
    setShowEmailError(false);
    router.push('/login');
  };

  return (
    <div className="flex max-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="flex flex-col gap-4">
          <CardHeader className="text-center">
            <CardTitle className="text-card-foreground text-2xl">Register</CardTitle>
            <CardDescription className="text-accent-foreground">Register your new account</CardDescription>
          </CardHeader>
          <Separator className="my-4"/>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="firstName" >
                    First Name
                  </Label>
                  <Input id="firstName" {...register("firstName", { required: true })} />
                  {errors.firstName && <p className="text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="lastName" >
                    Last Name
                  </Label>
                  <Input id="lastName" {...register("lastName", { required: true })} />
                  {errors.lastName && <p className="text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="email" >
                  Email
                </Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
                {errors.email && <p className=" text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password" >
                  Password
                </Label>
                <Input id="password" type="password" {...register("password", { required: true })} />
                {errors.password && <p className="text-destructive">{errors.password.message}</p>}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Register'}
              </Button>
            </form>
            <CardFooter className="text-center">
              <Button variant="link" onClick={() => router.push('/login')}>
                Already have an account? Login
              </Button>
            </CardFooter>
          </CardContent>
        </Card>
      </div>

      {registrationData && (
        <SetUsernameDialog
          isOpen={showUsernameDialog}
          onClose={() => {
            setShowUsernameDialog(false);
            setRegistrationData(null);
          }}
          onSubmit={handleUsernameSubmit}
        />
      )}

      <AlertDialog open={showEmailError} onOpenChange={setShowEmailError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email Already Registered</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleEmailErrorDismiss}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDismiss}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
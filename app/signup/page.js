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

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { handleSubmit, register } = useForm();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
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
    setErrorMessage('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Automatically sign in the user after successful registration
        const signInResponse = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (signInResponse?.ok) {
          router.push('/set-username');
        } else {
          setErrorMessage('Registration successful, but auto-login failed. Please log in manually.');
          router.push('/login');
        }
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex max-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {errorMessage && (
          <p className="text-red-500 mb-4">{errorMessage}</p>
        )}
        <Card className="p-4 flex flex-col gap-6 my-6 ">
          <CardHeader className="flex ">
            <CardTitle className="text-center ">Register</CardTitle>
            <CardDescription className="text-center pt-3">Register your new account</CardDescription>
          </CardHeader>
          <Separator className="p-0"/>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-row gap-4">
                <div className="flex flex-col ">
                <Label htmlFor="firstName" >
                  First Name
                </Label>
                <Input id="firstName" {...register("firstName", { required: true })} />
                </div>
                <div className="flex flex-col">
                <Label htmlFor="lastName" >
                  Last Name
                </Label>
                <Input id="lastName" {...register("lastName", { required: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="email" >
                  Email
                </Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
              </div>
              <div>
                <Label htmlFor="password" >
                  Password
                </Label>
                <Input id="password" type="password" {...register("password", { required: true })} />
              </div>
              <Button type="submit" className="w-full">
                Register
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
    </div>
  );
}
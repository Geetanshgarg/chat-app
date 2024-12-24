"use client";

import Image from "next/image"
import React, { useEffect } from 'react';
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Separator } from "@radix-ui/react-separator";

export default function LoginPage() {
  const router = useRouter();
  const { handleSubmit, register } = useForm();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.username) {
        router.push(`/${session.user.username}`);
      } else {
        router.push("/set-username");
      }
    }
  }, [status, router ,session]);
  
  const onSubmit = async (data) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/profile");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('An error occurred during login');
    }
  };

  const onGoogleLogin = async () => {
    await signIn("google");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="p-6 flex flex-col gap-6">
          <CardHeader className="flex gap-4">
            <CardTitle className="text-center">Login</CardTitle>
            <CardDescription className="text-center">Enter your email and password to login</CardDescription>
          </CardHeader>
         <Separator className="p-0"/>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <label htmlFor="email">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...register("email")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    {...register("password")}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
                <Button variant="outline" className="w-full mt-5" onClick={onGoogleLogin}>
                  Login with Google
                </Button>
                <Button variant="link" className="w-full" onClick={() => router.push("/signup")}>
                  Create an account 
                </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
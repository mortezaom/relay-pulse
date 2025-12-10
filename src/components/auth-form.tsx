"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type LoginSchemaType,
  loginSchema,
  type SetupSchemaType,
  setupSchema,
} from "@/data/auth-form-data";
import type { RestResponse } from "@/lib/types";
import { Button } from "./ui/button";

const AuthForm = ({ isInitialized }: { isInitialized: boolean }) => {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SetupSchemaType | LoginSchemaType) => {
    setLoading(true);

    const response = await fetch(`/api/${isInitialized ? "login" : "setup"}`, {
      body: JSON.stringify(data),
      method: "POST",
    });

    setLoading(false);

    const responseJson = (await response.json()) as RestResponse;

    if (responseJson.ok) {
      toast.success(`${isInitialized ? "Login" : "Initialized"} Successfully!`);

      setTimeout(() => {
        redirect("/dashboard");
      }, 2000);
    } else {
      toast.error(responseJson.message);
    }
  };

  return isInitialized ? (
    <AuthLoginForm loading={loading} onSubmit={onSubmit} />
  ) : (
    <AuthSetupForm loading={loading} onSubmit={onSubmit} />
  );
};

export default AuthForm;

const AuthSetupForm: React.FC<{
  onSubmit: (arg: SetupSchemaType) => void;
  loading: boolean;
}> = ({ onSubmit, loading }) => {
  const form = useForm<SetupSchemaType>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      password: "",
      secret: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="auth@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="--------" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret</FormLabel>
              <FormControl>
                <Input
                  autoComplete="one-time-code"
                  placeholder="--------"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="flex w-full items-center"
          disabled={loading}
          type="submit"
        >
          {loading && <Loader2Icon className="animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
};

const AuthLoginForm: React.FC<{
  onSubmit: (data: LoginSchemaType) => void;
  loading: boolean;
}> = ({ onSubmit, loading }) => {
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="auth@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="--------" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="flex w-full items-center"
          disabled={loading}
          type="submit"
        >
          {loading && <Loader2Icon className="animate-spin" />}
          Login
        </Button>
      </form>
    </Form>
  );
};

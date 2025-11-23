"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BrandingDataType } from "@/data/branding-data";
import { Textarea } from "../ui/textarea";
import BrandingFileUpload from "./branding-file-upload";

type BrandingFormProps = {
  data: BrandingDataType | null;
};

const formSchema = z.object({
  title: z.string().check(z.trim(), z.minLength(2)),
  description: z.string().check(z.trim(), z.minLength(2)),
  alertText: z.string().check(z.trim(), z.minLength(2)),
});

type FormType = z.infer<typeof formSchema>;

export function BrandingForm({ data }: BrandingFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [bLoading, setBLoading] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "Relay Pulse",
      description:
        data?.description || "Uptime monitoring and status page | Relay Pulse",
      alertText: data?.alert || "All Services are Operational!",
    },
  });

  const onSubmit = async (values: FormType) => {
    setBLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("alert", values.alertText);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("/api/branding", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body: { message?: string } = await response.json();
        const errorText = body?.message || "Failed to submit branding data";

        toast.error(errorText);
        setBLoading(false);
        return;
      }

      toast.success("Branding data submitted successfully!");
      setBLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit branding data");
      setBLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-2 items-start gap-8">
          <div className="flex flex-col items-stretch gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Relay Pulse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alertText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Text</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="All Services are Operational!"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <BrandingFileUpload
              currentImage={data?.imageUrl ?? null}
              onFileChangeAction={(file: File | null) => setSelectedFile(file)}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (SEO)</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-24"
                    placeholder="Description for Search Engines"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-start">
          <Button
            className="flex w-full items-center px-10 py-5"
            disabled={bLoading}
            type="submit"
            variant="outline"
          >
            {bLoading && <Loader2Icon className="animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}

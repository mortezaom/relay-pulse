"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod/v4-mini";

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
import { Textarea } from "../ui/textarea";
import BrandingFileUpload from "./branding-file-upload";

const formSchema = z.object({
	title: z.string().check(z.trim(), z.minLength(2)),
	description: z.string().check(z.trim(), z.minLength(2)),
	alertText: z.string().check(z.trim(), z.minLength(2)),
});

export function BrandingForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			alertText: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col space-y-8 w-full"
			>
				<div className="items-start gap-8 grid grid-cols-2">
					<div className="flex flex-col items-stretch gap-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											placeholder="Relay Pulse"
											{...field}
										/>
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
						<BrandingFileUpload />
					</div>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Description for Search Engines"
										className="min-h-24"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex justify-start">
					<Button type="submit" variant="outline" className="px-10 py-5">
						Submit
					</Button>
				</div>
			</form>
		</Form>
	);
}

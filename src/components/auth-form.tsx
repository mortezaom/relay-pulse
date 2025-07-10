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

		const response = await fetch(
			`/api/${isInitialized ? "login" : "setup"}`,
			{
				body: JSON.stringify(data),
				method: "POST",
			},
		);

		setLoading(false);

		const responseJson = (await response.json()) as RestResponse;

		if (!responseJson.ok) {
			toast.error(responseJson.message);
		} else {
			toast.success(
				`${isInitialized ? "Login" : "Initialized"} Successfully!`,
			);

			setTimeout(() => {
				redirect("/dashboard");
			}, 2000);
		}
	};

	return isInitialized ? (
		<AuthLoginForm onSubmit={onSubmit} loading={loading} />
	) : (
		<AuthSetupForm onSubmit={onSubmit} loading={loading} />
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
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="auth@example.com"
									{...field}
								/>
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
								<Input
									type="password"
									placeholder="--------"
									{...field}
								/>
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
									type="password"
									autoComplete="one-time-code"
									placeholder="--------"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full flex items-center"
					disabled={loading}
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
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="auth@example.com"
									{...field}
								/>
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
								<Input
									type="password"
									placeholder="--------"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full flex items-center"
					disabled={loading}
				>
					{loading && <Loader2Icon className="animate-spin" />}
					Login
				</Button>
			</form>
		</Form>
	);
};

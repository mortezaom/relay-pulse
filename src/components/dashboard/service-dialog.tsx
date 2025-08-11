"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type ServiceType, serviceSchema } from "@/data/services-data";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";

type ServiceDialogProps = {
	service?: ServiceType | null;
	open: boolean;
	onOpenChangeAction: (open: boolean) => void;
	onServiceSavedAction?: (service?: ServiceType) => void;
};

export function ServiceDialog(props: ServiceDialogProps) {
	const { service, open, onOpenChangeAction, onServiceSavedAction } = props;
	const [loading, setLoading] = useState(false);

	const form = useForm<ServiceType>({
		resolver: zodResolver(serviceSchema),
		defaultValues: service ?? {
			id: -1,
			port: 80,
			type: "http",
			name: "",
			address: "",
		},
	});

	const onSubmit = async (values: ServiceType) => {
		setLoading(true);
		try {
			const response = await fetch("/api/services", {
				method: "POST",
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const body: { message?: string } = await response.json();
				const errorText = body?.message || "Failed to save service data";

				toast.error(errorText);
				setLoading(false);
				return;
			}

			const { data }: { data: ServiceType } = await response.json();

			toast.success("Service data saved successfully!");
			form.reset();
			if (onServiceSavedAction) {
				onServiceSavedAction(data);
			}
			setLoading(false);
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while saving service data");
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChangeAction}>
			<DialogContent className="sm:max-w-[425px]">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col space-y-8 w-full"
					>
						<DialogHeader>
							<DialogTitle>{service ? "Edit" : "Add"} Service</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Relay Pulse" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input placeholder="example.com | 10.0.0.1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="port"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Port</FormLabel>
										<FormControl>
											<Input type="number" placeholder="80" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl className="w-full">
												<SelectTrigger>
													<SelectValue placeholder="Select a type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="w-full">
												<SelectItem value="https">HTTPS</SelectItem>
												<SelectItem value="http">HTTP</SelectItem>
												<SelectItem value="tcp">TCP</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={loading}
								className="flex items-center w-28"
							>
								{loading && <Loader2Icon className="animate-spin" />}
								Submit
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

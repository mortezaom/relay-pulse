"use client";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ServiceType } from "@/data/services-data";
import { Button } from "../ui/button";

export function ServiceDeleteDialog({
	service,
	open,
	onOpenChangeAction,
	onServiceDeletedAction,
}: {
	service?: ServiceType | null;
	open: boolean;
	onOpenChangeAction: (open: boolean) => void;
	onServiceDeletedAction?: (service?: ServiceType) => void;
}) {
	const [loading, setLoading] = useState(false);

	const handleDelete = async () => {
		if (!service || !service.id) return;

		setLoading(true);
		try {
			const response = await fetch(`/api/services/${service.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const body: { message?: string } = await response.json();
				const errorText = body?.message || "Failed to delete service";

				toast.error(errorText);
				setLoading(false);
				return;
			}

			toast.success("Service deleted successfully!");
			if (onServiceDeletedAction) {
				onServiceDeletedAction(service);
			}
			setLoading(false);
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while deleting the service");
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChangeAction}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Service</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this service? This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={() => onOpenChangeAction(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						disabled={loading}
						onClick={handleDelete}
					>
						{loading ? <Loader2Icon className="animate-spin" /> : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

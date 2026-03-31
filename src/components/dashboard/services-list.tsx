"use client";

import { formatDistanceToNow } from "date-fns";
import { FileEditIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ServiceDialog } from "@/components/dashboard/service-dialog";
import ServerBadge from "@/components/server-badge";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceType } from "@/data/services-data";
import { ServiceDeleteDialog } from "./service-delete-dialog";

export function ServicesList() {
  const [serviceModal, setServiceModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState<ServiceType[]>([]);

  const [editItem, setEditItem] = useState<ServiceType | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(
          `Failed to fetch services: ${res.status} ${res.statusText}`
        );
      }
      const { data }: { data: ServiceType[] } = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading services", err);
      toast.error(String(err));
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: onMounted
  useEffect(() => {
    loadData();
  }, []);

  const onServiceSaved = (service?: ServiceType) => {
    if (service) {
      setServices((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === service.id);
        if (existingIndex >= 0) {
          // Update existing service
          const updatedServices = [...prev];
          updatedServices[existingIndex] = service;
          return updatedServices;
        }
        // Add new service
        return [...prev, service];
      });
    }
    setServiceModal(false);
    setEditItem(null);
  };

  const onServiceDeleted = (service?: ServiceType) => {
    if (service) {
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    }
    setDeleteModal(false);
    setEditItem(null);
  };

  const handleEditItem = (service: ServiceType) => {
    setEditItem(service);
    setServiceModal(true);
  };

  const handleDeleteItem = (service: ServiceType) => {
    setEditItem(service);
    setDeleteModal(true);
  };

  const onSaveModalChange = (open: boolean) => {
    setServiceModal(open);
    if (!open) {
      setEditItem(null);
    }
  };

  const onDeleteModalChange = (open: boolean) => {
    setDeleteModal(open);
    if (!open) {
      setEditItem(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardAction>
          <Button
            onClick={() => setServiceModal(true)}
            size="sm"
            variant="default"
          >
            <PlusCircleIcon /> New Service
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Address</TableHead>
              <TableHead className="text-center">Port</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Uptime</TableHead>
              <TableHead className="text-center">Response Time</TableHead>
              <TableHead className="text-center">Last Check</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.id}</TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell className="text-center">
                  <ServerBadge>{service.type}</ServerBadge>
                </TableCell>
                <TableCell className="text-center">{service.address}</TableCell>
                <TableCell className="text-center">
                  {service.port ?? (service.type === "http" ? "80" : "443")}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={service.status} />
                </TableCell>
                <TableCell className="text-center">
                  {service.uptime !== undefined
                    ? `${service.uptime.toFixed(1)}%`
                    : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  {service.responseTime !== undefined
                    ? `${service.responseTime}ms`
                    : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  {service.lastCheck
                    ? formatDistanceToNow(new Date(service.lastCheck), {
                        addSuffix: true,
                      })
                    : "Never"}
                </TableCell>
                <TableCell className="flex items-center justify-center gap-2">
                  <Button
                    className="size-8"
                    onClick={() => handleEditItem(service)}
                    size="icon"
                    variant="ghost"
                  >
                    <FileEditIcon />
                  </Button>
                  <Button
                    className="size-8"
                    onClick={() => handleDeleteItem(service)}
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {loading && <ShimmerRow />}
            {!loading && services.length < 1 && (
              <TableRow>
                <TableCell
                  className="py-6 text-center font-semibold text-muted-foreground"
                  colSpan={10}
                >
                  No services found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {serviceModal && (
        <ServiceDialog
          onOpenChangeAction={onSaveModalChange}
          onServiceSavedAction={onServiceSaved}
          open={serviceModal}
          service={editItem}
        />
      )}
      <ServiceDeleteDialog
        onOpenChangeAction={onDeleteModalChange}
        onServiceDeletedAction={onServiceDeleted}
        open={deleteModal}
        service={editItem}
      />
    </Card>
  );
}

const ShimmerRow = () => (
  <TableRow key={"shimmer"}>
    <TableCell className="justify-center">
      <Skeleton className="h-5 w-2.5" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-36" />
    </TableCell>
    <TableCell className="text-center">
      <Skeleton className="mx-auto h-5 w-15" />
    </TableCell>
    <TableCell className="text-center">
      <Skeleton className="mx-auto h-5 w-32" />
    </TableCell>
    <TableCell className="text-center">
      <Skeleton className="mx-auto h-5 w-12" />
    </TableCell>
    <TableCell className="flex items-center justify-center gap-2" />
  </TableRow>
);

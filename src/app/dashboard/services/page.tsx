"use client";

import { ServicesList } from "@/components/dashboard/services-list";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Services</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all the services to be monitored and related settings
            settings
          </p>
        </div>
      </div>

      <ServicesList />
      <br />
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}

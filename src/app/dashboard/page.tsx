import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BrandingForm } from "@/components/dashboard/branding-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrandingData } from "@/data/branding-storage";

export default async function Dashboard() {
  const env = (await getCloudflareContext({ async: true })).env;
  const data = await getBrandingData(env);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your services and branding settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandingForm data={data} />
        </CardContent>
      </Card>
    </div>
  );
}

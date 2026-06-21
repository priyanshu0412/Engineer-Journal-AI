import { getSettings, type UserSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings: UserSettings | null = null;
  let error: string | null = null;
  try {
    settings = await getSettings();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load settings.";
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and email preferences.</p>
      </div>
      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : (
        settings && <SettingsForm initial={settings} />
      )}
    </div>
  );
}

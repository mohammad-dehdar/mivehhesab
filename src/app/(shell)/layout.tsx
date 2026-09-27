import { DbProvider } from "@/platform/db";
import { AppShell } from "@/shared/components/app-shell";

export default function ShellLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell>
      {/* Screens render once the on-device database is open. */}
      <DbProvider>{children}</DbProvider>
    </AppShell>
  );
}

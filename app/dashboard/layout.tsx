import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const isAdmin = user.user_metadata?.role === "admin";

  return (
    <DashboardLayoutClient isAdmin={!!isAdmin}>
      {children}
    </DashboardLayoutClient>
  );
}

import { createClient } from "@/lib/supabase/server";
import { MensalistasClient } from "./mensalistas-client";

export const dynamic = "force-dynamic";

export default async function MensalistasPage() {
  const supabase = await createClient();
  const { data: mensalistas } = await supabase
    .from("mensalistas")
    .select("*")
    .order("nome");

  return (
    <div style={{ maxWidth: "800px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Mensalistas</h1>
      <MensalistasClient initial={mensalistas ?? []} />
    </div>
  );
}

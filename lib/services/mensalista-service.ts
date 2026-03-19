import { createClient } from "@/lib/supabase/client";
import { validarPlaca, normalizarPlaca } from "@/lib/utils/placa";

export async function listarMensalistas() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mensalistas")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data;
}

export async function criarMensalista(nome: string, placa: string, validade_ate: string) {
  const placaNorm = normalizarPlaca(placa);
  if (!validarPlaca(placaNorm)) {
    throw new Error("Placa inválida. Use formato ABC-1234 ou ABC1D23");
  }
  const supabase = createClient();
  const { error } = await supabase.from("mensalistas").insert({
    nome,
    placa: placaNorm,
    validade_ate,
    ativo: true,
  });
  if (error) throw error;
}

export async function atualizarMensalista(
  id: string,
  data: { nome?: string; placa?: string; validade_ate?: string; ativo?: boolean }
) {
  const supabase = createClient();
  if (data.placa) {
    data.placa = normalizarPlaca(data.placa);
    if (!validarPlaca(data.placa)) {
      throw new Error("Placa inválida. Use formato ABC-1234 ou ABC1D23");
    }
  }
  const { error } = await supabase.from("mensalistas").update(data).eq("id", id);
  if (error) throw error;
}

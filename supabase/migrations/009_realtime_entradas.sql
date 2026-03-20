-- Migration 009: Habilitar Realtime para tabela entradas
-- Necessário para postgres_changes funcionar (entradas ativas, mapa)
-- Sem isso, as alterações não são transmitidas via WebSocket

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'entradas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE entradas;
  END IF;
END $$;

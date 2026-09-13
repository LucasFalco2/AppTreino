const { randomUUID } = require("crypto");

// Este arquivo é um adaptador — troque a implementação interna por chamadas
// reais ao Supabase Storage ou S3 quando configurar as credenciais no .env.
// Mantém o resto da aplicação desacoplado do provedor de storage escolhido.

const BUCKET = process.env.STORAGE_BUCKET_PHOTOS || "progress-photos-private";

async function getSignedUploadUrl(studentId, contentType) {
  const storageKey = `${BUCKET}/${studentId}/${randomUUID()}`;

  if (process.env.STORAGE_PROVIDER === "supabase" && process.env.SUPABASE_URL) {
    // Exemplo real (descomentar após instalar @supabase/supabase-js e configurar env):
    //
    // const { createClient } = require("@supabase/supabase-js");
    // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    // const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(storageKey);
    // if (error) throw error;
    // return { uploadUrl: data.signedUrl, storageKey };
  }

  // Stub de desenvolvimento — não faz upload real, apenas devolve uma chave.
  return { uploadUrl: `https://example-storage.local/upload/${storageKey}`, storageKey };
}

async function getSignedReadUrl(storageKey) {
  if (process.env.STORAGE_PROVIDER === "supabase" && process.env.SUPABASE_URL) {
    // const { data } = await supabase.storage.from(BUCKET).createSignedUrl(storageKey, 60 * 5);
    // return data.signedUrl;
  }
  return `https://example-storage.local/read/${storageKey}?expires=300`;
}

module.exports = { getSignedUploadUrl, getSignedReadUrl };

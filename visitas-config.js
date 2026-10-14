/* Analytics do portfólio — visitas reais via Supabase.
   1) Execute o SQL em supabase/visits.sql no editor SQL do seu projeto Supabase.
   2) Preencha os 3 campos abaixo (Project Settings → API no painel do Supabase).
   Enquanto estiverem vazios, o rastreamento fica desligado (nada é enviado). */
window.KLEBER_VISITS = {
  SUPABASE_URL: '',      // ex.: https://abcdefghij.supabase.co
  SUPABASE_ANON_KEY: '', // chave "anon public" do projeto
  ADMIN_KEY: '565a62ba030e065554c09f7763051606' // mesma string usada em supabase/visits.sql
};

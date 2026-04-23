// ═══════════════════════════════════════════════════════
//  CONFIGURATION SUPABASE — À remplir avec tes clés
//  Récupère-les dans : Supabase > Settings > API
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = 'https://XXXXXXXXXXXXXXXX.supabase.co';  // ← remplace
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXX'; // ← remplace

const ADMIN_EMAIL = 'james.gigot@reseau.sncf.fr';

// ── Initialisation du client Supabase ──
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ═══════════════════════════════════════════════════════
//  HELPERS AUTH
// ═══════════════════════════════════════════════════════

async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function getProfile(userId) {
  const { data } = await db
    .from('profils')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = '/index.html';
}

// ═══════════════════════════════════════════════════════
//  GUARD — redirige si non connecté
// ═══════════════════════════════════════════════════════

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

/* ═══════════════════════════════════════════════════════
   SQL À EXÉCUTER UNE SEULE FOIS dans Supabase > SQL Editor
   ═══════════════════════════════════════════════════════

-- 1. Table profils (données supplémentaires liées à auth.users)
CREATE TABLE profils (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  prenom      TEXT NOT NULL,
  nom         TEXT NOT NULL,
  telephone   TEXT,
  entreprise  TEXT,
  statut      TEXT NOT NULL DEFAULT 'en_attente',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table demandes de sillons
CREATE TABLE demandes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reference       TEXT NOT NULL,
  date_souhaitee  DATE NOT NULL,
  demandeur       TEXT NOT NULL,
  conducteur      TEXT NOT NULL,
  materiel        TEXT NOT NULL,
  tare            INTEGER,
  longueur        INTEGER,
  vl              INTEGER,
  categorie       TEXT,
  parcours        TEXT NOT NULL,
  heure_depart    TIME,
  heure_arrivee   TIME,
  code_statut     TEXT,
  vds             TEXT,
  remarques       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sécurité Row Level Security (RLS)
ALTER TABLE profils  ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut lire/modifier son propre profil
CREATE POLICY "Profil perso" ON profils
  FOR ALL USING (auth.uid() = id);

-- L'admin peut tout lire sur les profils
CREATE POLICY "Admin profils" ON profils
  FOR ALL USING (auth.jwt() ->> 'email' = 'james.gigot@reseau.sncf.fr');

-- Un utilisateur peut créer et lire ses propres demandes
CREATE POLICY "Demandes perso" ON demandes
  FOR ALL USING (auth.uid() = user_id);

-- L'admin peut tout lire sur les demandes
CREATE POLICY "Admin demandes" ON demandes
  FOR ALL USING (auth.jwt() ->> 'email' = 'james.gigot@reseau.sncf.fr');

*/

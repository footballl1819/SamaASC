# Instructions de configuration pour le multi-tenancy

## 1. Appliquer la migration de base de données

Exécutez la migration SQL suivante dans votre projet Supabase:

```sql
-- Le fichier de migration se trouve dans: supabase/migrations/20260608020000_add_multi_tenant_support.sql
```

Vous pouvez l'appliquer via:
- Le dashboard Supabase (SQL Editor)
- En ligne de commande avec Supabase CLI: `supabase db push`

## 2. Créer le bucket Supabase Storage

1. Allez dans le dashboard Supabase
2. Naviguez vers "Storage"
3. Créez un nouveau bucket nommé `team-assets`
4. Configurez les permissions:
   - Public: true (pour permettre l'accès public aux images)
   - File size limit: 5MB (ou selon vos besoins)
5. Ajoutez une politique RLS pour le bucket:
   ```sql
   -- Activer RLS sur le bucket
   ALTER STORAGE team-assets ENABLE ROW LEVEL SECURITY;

   -- Politique pour permettre l'upload public
   CREATE POLICY "Public Upload" ON storage.objects FOR INSERT 
   TO anon, authenticated WITH CHECK (bucket_id = 'team-assets');

   -- Politique pour permettre la lecture publique
   CREATE POLICY "Public Read" ON storage.objects FOR SELECT 
   TO anon, authenticated USING (bucket_id = 'team-assets');
   ```

## 3. Tester l'application

1. Lancez le serveur de développement: `npm run dev`
2. Accédez à http://localhost:3000
3. Vous serez redirigé vers la page de connexion
4. Créez un compte d'équipe via le lien "Créer une équipe"
5. Configurez votre équipe dans la page "Paramètres" (logo, couleurs)
6. Ajoutez des joueurs, matchs, etc. via la page "Admin"

## Fonctionnalités implémentées

✅ Multi-tenancy: Chaque équipe a ses propres données isolées
✅ Page de paramètres: Personnalisation des couleurs et logo de l'équipe
✅ Authentification par équipe: Login/Register avec slug
✅ Upload de fichiers direct: Remplacement des URLs par des uploads depuis l'appareil
✅ Filtrage par équipe: Toutes les pages utilisent team_id pour isoler les données

## Structure des données

- `teams`: Table des équipes avec configuration (couleurs, logo)
- `players`, `matches`, `announcements`, `standings`, `gallery`, `supporters`: Toutes les tables ont maintenant un `team_id`
- `match_votes`, `match_lineup`, `player_stats`, `coach`: Également liées à une équipe

## Notes importantes

- Assurez-vous que le bucket `team-assets` est créé avant d'essayer d'uploader des images
- Les équipes sont identifiées par leur `slug` (identifiant unique)
- Les couleurs personnalisées peuvent être utilisées pour thémiser l'application (à implémenter)

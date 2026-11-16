# Relais Support Discord TennoFrame (Cloudflare Worker — 0 €/mois)

Ce micro-worker gratuit protège ton **Webhook Discord** : l'URL secrète du Webhook reste chiffrée chez Cloudflare et n'est **jamais** incluse dans `TennoFrame-Setup.exe`.

## Déploiement en 3 commandes (2 minutes, gratuit sans carte bancaire)

1. Crée un Webhook dans ton salon Discord `#support` (salon texte ou salon Forum) et copie son URL.
2. Ouvre un terminal dans ce dossier (`workers/discord-support-relay`) et exécute :

```powershell
npx wrangler login
npx wrangler secret put DISCORD_SUPPORT_WEBHOOK_URL
npx wrangler deploy
```

3. Cloudflare t'affiche ton URL publique du type :
   `https://tennoframe-support.<ton-sous-domaine>.workers.dev`
4. Ajoute `https://tennoframe-support.<ton-sous-domaine>.workers.dev/v1/ticket` :
   - soit dans `DEFAULT_SUPPORT_RELAY_URL` (`src/shared/constants.ts`),
   - soit dans **GitHub → Settings → Secrets and variables → Actions → Variables** sous le nom `TENNOFRAME_SUPPORT_RELAY_URL`.

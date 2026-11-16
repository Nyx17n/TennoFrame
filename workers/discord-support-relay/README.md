# Relais Support Discord TennoFrame — 3 Salons Dédiés (Cloudflare Worker — 0 €/mois)

Ce micro-worker gratuit redirige automatiquement chaque catégorie vers son **propre Webhook Discord** (tout en gardant les 3 URLs secrètes hors de `TennoFrame-Setup.exe`) :
- **`🐛 Bug Report`** → `DISCORD_WEBHOOK_BUG`
- **`💡 Suggestion`** → `DISCORD_WEBHOOK_SUGGESTION`
- **`❓ Question / Help`** → `DISCORD_WEBHOOK_HELP`

## Déploiement en 3 minutes (gratuit sans carte bancaire)

1. Sur ton serveur Discord, crée un Webhook dans chacun de tes 3 salons (`#bugs`, `#suggestions`, `#help` — salons texte ou salons Forum).
2. Ouvre PowerShell dans ce dossier (`workers/discord-support-relay`) et lance :

```powershell
npx wrangler login
npx wrangler deploy
npx wrangler secret put DISCORD_WEBHOOK_BUG
npx wrangler secret put DISCORD_WEBHOOK_SUGGESTION
npx wrangler secret put DISCORD_WEBHOOK_HELP
```

3. Donne l'URL publique `https://tennoframe-support.<ton-pseudo>.workers.dev` affichée par `npx wrangler deploy` !

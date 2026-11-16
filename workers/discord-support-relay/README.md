# Relais Support Discord TennoFrame — 5 Couches Anti-Spam (Cloudflare Worker + KV)

## Règles actives
- **3 salons dédiés** : `DISCORD_WEBHOOK_BUG`, `DISCORD_WEBHOOK_SUGGESTION`, `DISCORD_WEBHOOK_HELP`.
- **Quota strict (PC chiffré + Cloudflare KV)** : **1 message toutes les 10 minutes** et **maximum 3 messages par 24h** (par IP + par installation).
- **Jeton HMAC anti-robots (`/v1/challenge`)** : usage unique + délai humain minimum de rédaction (`3,5 s`).
- **Filtre anti-déchets & anti-pub** : bloque le charabia, les messages en doublon et les invitations Discord externes.

## Bannir ou débannir un utilisateur (`Sender ID`) en 1 commande

Chaque ticket affiché dans ton Discord indique son identifiant anonyme (ex. `usr_8f3a1c2b`).

```powershell
cd workers/discord-support-relay

# Bannir définitivement un troll :
npx wrangler kv key put --remote --binding=SUPPORT_KV "ban:usr_8f3a1c2b" "banned"

# Débannir :
npx wrangler kv key delete --remote --binding=SUPPORT_KV "ban:usr_8f3a1c2b"
```

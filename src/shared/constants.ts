export const DISCORD_INVITE_CODE = 'DhGwHPf82n' as const
export const DISCORD_INVITE_URL = `https://discord.gg/${DISCORD_INVITE_CODE}` as const
export const GITHUB_REPO_URL = 'https://github.com/Nyx17n/TennoFrame' as const

/**
 * Public HTTPS endpoint of the Cloudflare Worker Support Relay (`workers/discord-support-relay/`).
 * Security rule: NEVER put a Discord Webhook URL here — only the public Worker relay URL!
 * Can also be injected at build time via `MAIN_VITE_SUPPORT_RELAY_URL`.
 */
export const DEFAULT_SUPPORT_RELAY_URL = '' as const



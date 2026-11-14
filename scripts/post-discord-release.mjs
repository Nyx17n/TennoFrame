import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const REPO_OWNER = 'Nyx17n'
const REPO_NAME = 'TennoFrame'
const ALLOWED_DISCORD_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'canary.discord.com',
  'ptb.discord.com'
])

function resolveTargetVersion() {
  const cliArg = process.argv.find((arg) => arg.startsWith('--version='))
  const rawTag = cliArg ? cliArg.slice('--version='.length) : process.env.RELEASE_TAG || ''
  const cleaned = rawTag.replace(/^refs\/tags\//, '').replace(/^v/i, '').trim()
  if (cleaned) return cleaned

  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
  return String(pkg.version).trim()
}

function validateDiscordWebhookUrl(rawUrl) {
  const parsed = new URL(rawUrl)
  if (parsed.protocol !== 'https:') {
    throw new Error('TLS Security: DISCORD_WEBHOOK_URL must use https://')
  }
  if (!ALLOWED_DISCORD_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`Unauthorized Discord Webhook host: ${parsed.hostname}`)
  }
  if (!parsed.pathname.startsWith('/api/webhooks/')) {
    throw new Error('Invalid Discord Webhook path (expected: /api/webhooks/...)')
  }
  parsed.searchParams.set('wait', 'true')
  return parsed.toString()
}

function buildRoleMention(rawRoleInput) {
  const trimmed = (rawRoleInput || '').trim()
  if (!trimmed) {
    return { content: undefined, allowedMentions: { parse: [] } }
  }
  if (trimmed === '@everyone' || trimmed === '@here') {
    return {
      content: `${trimmed} New **TennoFrame** update is now live!`,
      allowedMentions: { parse: ['everyone'] }
    }
  }
  const roleIdMatch = /^(?:<@&)?(\d{15,24})>?$/.exec(trimmed)
  if (!roleIdMatch?.[1]) {
    console.warn('[Discord Release] DISCORD_PING_ROLE_ID ignored (numeric Discord role ID expected).')
    return { content: undefined, allowedMentions: { parse: [] } }
  }
  const roleId = roleIdMatch[1]
  return {
    content: `<@&${roleId}> New **TennoFrame** update is now live!`,
    allowedMentions: { parse: [], roles: [roleId] }
  }
}

function buildReleaseContent(version) {
  const changelog = JSON.parse(readFileSync(resolve('src/shared/data/changelog.json'), 'utf8'))
  const rawEntry = changelog.find((item) => item.version === version)
  const entry = {
    version,
    date:
      rawEntry?.date ??
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    title: rawEntry?.title ?? rawEntry?.titleFr ?? `TennoFrame v${version} Update`,
    badge: rawEntry?.badge ?? rawEntry?.badgeFr ?? `Release v${version}`,
    highlights: rawEntry?.highlights ??
      rawEntry?.highlightsFr ?? [
        `Version v${version} is now available via the built-in auto-updater and Windows installer.`
      ]
  }

  const releaseUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${version}`
  const installerUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v${version}/TennoFrame-Setup-${version}.exe`
  const avatarUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/renderer/public/images/logo.png`

  const bullets = entry.highlights.map((line) => `• ${line}`).join('\n')
  const description = [
    `**${entry.badge}**`,
    '',
    bullets,
    '',
    '> *If TennoFrame is already installed on your PC, this update will be downloaded automatically on launch.*'
  ]
    .join('\n')
    .slice(0, 4000)

  const markdownReleaseBody = [
    `## ${entry.title} (\`v${version}\`)`,
    '',
    ...entry.highlights.map((line) => `- ${line}`),
    '',
    `### Download & Community`,
    `- **Windows Installer (x64)** : [TennoFrame-Setup-${version}.exe](${installerUrl})`,
    `- **Official Discord Server** : [Join discord.gg/DhGwHPf82n](https://discord.gg/DhGwHPf82n)`
  ].join('\n')

  return { entry, releaseUrl, installerUrl, avatarUrl, description, markdownReleaseBody }
}

function buildGitHubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'TennoFrame-Release-Bot'
  }
}

async function syncGitHubReleaseNotes(version, markdownBody) {
  const token = (process.env.GH_TOKEN || '').trim()
  if (!token) return

  const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
  const headers = buildGitHubHeaders(token)

  const tagRes = await fetch(`${apiBase}/releases/tags/v${version}`, { headers })
  if (!tagRes.ok) return

  const releaseData = await tagRes.json()
  if (!releaseData?.id) return

  await fetch(`${apiBase}/releases/${releaseData.id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `TennoFrame v${version}`,
      body: markdownBody
    })
  })
  console.log(`[GitHub Release] English patch notes synced on release v${version}.`)
}

/**
 * Prevents installation of any superseded version by deleting `.exe` and `.blockmap`
 * installer assets from all releases older than `v${activeVersion}`, and updating their
 * release notes to redirect users to `/releases/latest`.
 */
async function pruneLegacyReleaseInstallers(activeVersion) {
  const token = (process.env.GH_TOKEN || '').trim()
  if (!token) return

  const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
  const headers = buildGitHubHeaders(token)
  const activeTag = `v${activeVersion}`
  const latestUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`

  const listRes = await fetch(`${apiBase}/releases?per_page=100`, { headers })
  if (!listRes.ok) return

  const releases = await listRes.json()
  let deletedAssets = 0

  for (const rel of releases) {
    if (!rel?.id || rel.draft || rel.tag_name === activeTag) continue

    const installerAssets = (rel.assets || []).filter((asset) => {
      const lower = String(asset.name || '').toLowerCase()
      return lower.endsWith('.exe') || lower.endsWith('.blockmap')
    })

    for (const asset of installerAssets) {
      const delRes = await fetch(`${apiBase}/releases/assets/${asset.id}`, {
        method: 'DELETE',
        headers
      })
      if (delRes.ok || delRes.status === 204) {
        deletedAssets += 1
      }
    }

    const supersededBanner = `> ⚠️ **Superseded Release (\`${rel.tag_name}\`)** — Direct installation of older versions is disabled. Please install the latest version: **[Download Latest TennoFrame Release](${latestUrl})**.`
    const existingBody = String(rel.body || '')
    if (!existingBody.includes('Superseded Release')) {
      const cleanedBody = existingBody
        .replace(/\[[^\]]*Setup[^\]]*\.exe\]\([^)]+\)/gi, `[Latest TennoFrame Installer](${latestUrl})`)
      const updatedBody = `${supersededBanner}\n\n${cleanedBody}`.trim()
      await fetch(`${apiBase}/releases/${rel.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: updatedBody })
      })
    }
  }

  console.log(`[GitHub Release] Pruned ${deletedAssets} legacy installer asset(s) across older releases.`)
}

async function purgeGitHubCamoBadges() {
  const repoHtmlRes = await fetch(`https://github.com/${REPO_OWNER}/${REPO_NAME}`)
  if (!repoHtmlRes.ok) return
  const html = await repoHtmlRes.text()
  const camoUrls = Array.from(
    new Set(html.match(/https:\/\/camo\.githubusercontent\.com\/[a-f0-9]+\/[a-f0-9]+/g) ?? [])
  )
  await Promise.allSettled(camoUrls.map((url) => fetch(url, { method: 'PURGE' })))
  console.log(`[GitHub Camo] Refreshed ${camoUrls.length} README badge(s).`)
}

async function postToDiscord(webhookUrl, payload, threadNameFallback) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (res.ok) {
    console.log('[Discord Release] English patch notes posted to Discord!')
    return
  }

  const errText = await res.text()
  if (res.status === 400 && errText.includes('220001') && threadNameFallback) {
    const forumRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        thread_name: threadNameFallback.slice(0, 100)
      })
    })
    if (forumRes.ok) {
      console.log('[Discord Release] English patch notes posted to Discord Forum channel!')
      return
    }
    throw new Error(`Discord Forum post failed (${forumRes.status}): ${await forumRes.text()}`)
  }

  throw new Error(`Discord Webhook failed (${res.status}): ${errText}`)
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const skipDiscord = process.argv.includes('--skip-discord')
  const version = resolveTargetVersion()
  const { entry, releaseUrl, installerUrl, avatarUrl, description, markdownReleaseBody } =
    buildReleaseContent(version)
  const { content, allowedMentions } = buildRoleMention(process.env.DISCORD_PING_ROLE_ID)

  const discordPayload = {
    username: 'TennoFrame — Patch Notes',
    avatar_url: avatarUrl,
    ...(content ? { content } : {}),
    allowed_mentions: allowedMentions,
    embeds: [
      {
        title: `🚀 TennoFrame v${version} — ${entry.title}`,
        url: releaseUrl,
        color: 0x26b9d1,
        description,
        fields: [
          {
            name: '📥 Windows Installer (.exe)',
            value: `[Download TennoFrame-Setup-${version}.exe](${installerUrl})`,
            inline: true
          },
          {
            name: '📋 GitHub Release',
            value: `[View Release v${version}](${releaseUrl})`,
            inline: true
          }
        ],
        footer: {
          text: `TennoFrame by Maxime (Nyxo17) · ${entry.date}`
        },
        timestamp: new Date().toISOString()
      }
    ]
  }

  if (isDryRun) {
    console.log(JSON.stringify(discordPayload, null, 2))
    return
  }

  await syncGitHubReleaseNotes(version, markdownReleaseBody).catch((err) => {
    console.warn('[GitHub Release] Failed to update GitHub Release description:', err.message)
  })
  await pruneLegacyReleaseInstallers(version).catch((err) => {
    console.warn('[GitHub Release] Failed to prune legacy installers:', err.message)
  })
  await purgeGitHubCamoBadges().catch(() => undefined)

  if (skipDiscord) {
    return
  }

  const rawWebhook = (process.env.DISCORD_WEBHOOK_URL || '').trim()
  if (!rawWebhook) {
    console.log('[Discord Release] DISCORD_WEBHOOK_URL not set — skipping Discord announcement.')
    return
  }

  const validWebhookUrl = validateDiscordWebhookUrl(rawWebhook)
  await postToDiscord(
    validWebhookUrl,
    discordPayload,
    `TennoFrame v${version} — ${entry.title}`
  )
}

main().catch((err) => {
  console.error('[Discord Release] Error:', err)
  process.exit(1)
})

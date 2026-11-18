import * as React from 'react'
import { ImagePlus, Loader2, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react'
import {
  SUPPORT_RAW_IMAGE_MAX_BYTES,
  type SupportSanitizedAttachment
} from '@shared/schemas/support.schema'
import { Button } from '@/components/ui/button'
import type { FontAndSupportStrings } from '@/lib/i18n/typography-support-i18n'

const ALLOWED_INPUT_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const ALLOWED_EXT_REGEX = /\.(png|jpe?g|webp)$/i

interface SupportAttachmentDropzoneProps {
  readonly attachment: SupportSanitizedAttachment | null
  readonly isProcessing: boolean
  readonly errorMessage: string | null
  readonly disabled: boolean
  readonly isCompactMode: boolean
  readonly strings: FontAndSupportStrings
  readonly onSelectFile: (file: File) => void
  readonly onRemove: () => void
}

function formatByteSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function isCandidateRasterImageFile(file: File): string | null {
  if (file.size <= 0) {
    return 'Empty file.'
  }
  if (file.size > SUPPORT_RAW_IMAGE_MAX_BYTES) {
    return 'Image exceeds the 8 MB maximum limit.'
  }
  const mime = (file.type || '').toLowerCase()
  const name = file.name || ''
  if (mime && !ALLOWED_INPUT_MIMES.has(mime)) {
    return `Blocked file type (${mime}). Only PNG, JPG, and WebP images are allowed.`
  }
  if (!mime && name && !ALLOWED_EXT_REGEX.test(name)) {
    return 'Unsupported file extension. Only .png, .jpg, .jpeg, and .webp are allowed.'
  }
  return null
}

export function SupportAttachmentDropzone({
  attachment,
  isProcessing,
  errorMessage,
  disabled,
  isCompactMode,
  strings,
  onSelectFile,
  onRemove
}: SupportAttachmentDropzoneProps): React.JSX.Element {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file && !disabled) {
      onSelectFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled || isProcessing) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onSelectFile(file)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{strings.supportImageLabel}</span>
        {!attachment && (
          <span className="font-mono text-[10px] text-muted-foreground">PNG · JPG · WebP</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={disabled || isProcessing}
        onChange={handleInputChange}
        className="hidden"
      />

      {isProcessing ? (
        <div className="flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-3 text-xs text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-medium">{strings.supportImageProcessing}</span>
        </div>
      ) : attachment ? (
        <div className="flex items-center justify-between gap-2.5 rounded-md border border-emerald-500/40 bg-emerald-500/5 p-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={`data:${attachment.mimeType};base64,${attachment.dataBase64}`}
              alt="Support screenshot preview"
              className={`shrink-0 rounded border border-border/80 bg-background object-cover ${
                isCompactMode ? 'h-11 w-11' : 'h-14 w-20'
              }`}
            />
            <div className="min-w-0 space-y-0.5">
              <div className="truncate font-mono text-[11px] font-semibold tabular-nums text-foreground">
                {attachment.width}×{attachment.height} · {formatByteSize(attachment.byteLength)} ·{' '}
                {attachment.mimeType === 'image/png' ? 'PNG' : 'JPEG'}
              </div>
              <div className="flex items-center gap-1 truncate text-[10px] text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">{strings.supportImageVerifiedBadge}</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onRemove}
            className="h-7 shrink-0 gap-1 border-red-500/35 px-2 text-[11px] text-red-300 hover:bg-red-500/15 hover:text-red-200"
          >
            <Trash2 className="h-3 w-3" />
            {!isCompactMode && <span>{strings.supportImageRemoveBtn}</span>}
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) fileInputRef.current?.click()
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2.5 transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/80 bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <ImagePlus className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-[11px]">{strings.supportImageHint}</span>
          </div>
          <span className="shrink-0 rounded border border-border bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-foreground">
            {strings.supportImageBrowseBtn}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-1.5 rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-200">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
          <div>
            <span className="font-semibold">{strings.supportImageBlockedTitle} </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

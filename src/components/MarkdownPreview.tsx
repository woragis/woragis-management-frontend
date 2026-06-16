import { useState } from 'react'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let inCode = false
  let codeBuf: string[] = []

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`)
        codeBuf = []
        inCode = false
      } else {
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      continue
    }
    if (line.startsWith('### ')) {
      html.push(`<h4>${inlineFormat(line.slice(4))}</h4>`)
    } else if (line.startsWith('## ')) {
      html.push(`<h3>${inlineFormat(line.slice(3))}</h3>`)
    } else if (line.startsWith('# ')) {
      html.push(`<h2>${inlineFormat(line.slice(2))}</h2>`)
    } else if (line.trim() === '') {
      html.push('<br />')
    } else if (line.startsWith('- ')) {
      html.push(`<p>• ${inlineFormat(line.slice(2))}</p>`)
    } else {
      html.push(`<p>${inlineFormat(line)}</p>`)
    }
  }

  return html.join('\n')
}

type MarkdownPreviewProps = {
  value: string
  className?: string
}

export function MarkdownPreview({ value, className = '' }: MarkdownPreviewProps) {
  if (!value.trim()) {
    return <div className={`markdown-preview empty muted ${className}`}>Nothing to preview.</div>
  }
  return (
    <div
      className={`markdown-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
    />
  )
}

type MarkdownFieldProps = {
  label: string
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number
}

export function MarkdownField({
  label,
  name,
  defaultValue = '',
  value,
  onChange,
  rows = 5,
}: MarkdownFieldProps) {
  const [internal, setInternal] = useState(defaultValue)
  const preview = value ?? internal

  function handleChange(v: string) {
    setInternal(v)
    onChange?.(v)
  }

  return (
    <div className="markdown-field full">
      <span className="field-label">{label}</span>
      <div className="markdown-split">
        <textarea
          name={name}
          rows={rows}
          value={preview}
          onChange={(e) => handleChange(e.target.value)}
        />
        <div>
          <div className="preview-label muted small">Preview</div>
          <MarkdownPreview value={preview} />
        </div>
      </div>
    </div>
  )
}

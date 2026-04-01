'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import {
  buildTransactionImportPreview,
  type CsvImportTransactionPreview,
  type TransactionImportCategory,
  type TransactionImportRow,
} from '@/modules/imports'
import { CheckCircle2, FileUp, LoaderCircle, RefreshCcw, Sparkles } from 'lucide-react'

type CsvImportReviewPanelProps = {
  availableCategories: TransactionImportCategory[]
  initialCsvText?: string
}

type CommitResponse = {
  committedRows?: number
  skippedRows?: Array<{ line: number; reasons: string[] }>
  error?: string
}

function formatCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`
}

function rowKey(row: TransactionImportRow) {
  return `${row.line}-${row.transaction.description}-${row.transaction.value}`
}

function formatSuggestedCategories(
  suggestedCategoryIds: number[] | undefined,
  availableCategories: TransactionImportCategory[],
) {
  if (!suggestedCategoryIds || suggestedCategoryIds.length === 0) {
    return 'Sem sugestão automática disponível.'
  }

  const suggestedNames = suggestedCategoryIds
    .map((categoryId) =>
      availableCategories.find((category) => category.id === categoryId)?.name ?? `#${categoryId}`,
    )
    .join(', ')

  return `Sugestões: ${suggestedNames}`
}

function buildDefaultNotice(
  preview: CsvImportTransactionPreview,
  reviewAcknowledged: boolean,
  previewToken: string | null,
) {
  if (!previewToken) {
    return 'Valide o preview no servidor antes de liberar a confirmação real.'
  }

  if (!preview.readyToCommit) {
    return 'Revise os itens pendentes para liberar a confirmação.'
  }

  if (!reviewAcknowledged) {
    return 'Marque a revisão para habilitar a confirmação.'
  }

  return 'A confirmação real está liberada para persistir as linhas prontas.'
}

async function readJsonResponse(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function buildCommitDetails(payload: CommitResponse | null) {
  if (!payload?.skippedRows?.length) {
    return []
  }

  return payload.skippedRows.map((row) => `Linha ${row.line}: ${row.reasons.join(' · ')}`)
}

export function CsvImportReviewPanel({
  availableCategories,
  initialCsvText = '',
}: CsvImportReviewPanelProps) {
  const [csvText, setCsvText] = useState(initialCsvText)
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false)
  const [sourceLabel, setSourceLabel] = useState(
    initialCsvText ? 'Conteúdo inicial' : 'Aguardando CSV',
  )
  const [serverPreview, setServerPreview] = useState<CsvImportTransactionPreview | null>(null)
  const [previewToken, setPreviewToken] = useState<string | null>(null)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [previewFeedback, setPreviewFeedback] = useState<string | null>(null)
  const [commitStatus, setCommitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [commitFeedback, setCommitFeedback] = useState<string | null>(null)
  const [commitDetails, setCommitDetails] = useState<string[]>([])

  const localPreview = useMemo(
    () => buildTransactionImportPreview(csvText, availableCategories),
    [availableCategories, csvText],
  )

  const preview = serverPreview ?? localPreview
  const canValidatePreview = csvText.trim().length > 0 && previewStatus !== 'loading' && commitStatus !== 'loading'
  const canConfirm =
    Boolean(previewToken) &&
    preview.readyToCommit &&
    reviewAcknowledged &&
    previewStatus === 'success' &&
    commitStatus !== 'loading'

  function resetReviewFlow(nextSourceLabel: string) {
    setSourceLabel(nextSourceLabel)
    setReviewAcknowledged(false)
    setServerPreview(null)
    setPreviewToken(null)
    setPreviewStatus('idle')
    setPreviewFeedback(null)
    setCommitStatus('idle')
    setCommitFeedback(null)
    setCommitDetails([])
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const text = await file.text()
    setCsvText(text)
    resetReviewFlow(file.name)
  }

  function handleCsvTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setCsvText(event.target.value)
    resetReviewFlow('Conteúdo colado')
  }

  async function handlePreviewSync() {
    if (!csvText.trim()) {
      return
    }

    setPreviewStatus('loading')
    setPreviewFeedback(null)
    setCommitStatus('idle')
    setCommitFeedback(null)
    setCommitDetails([])

    try {
      const response = await fetch('/api/imports/transactions/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: csvText,
          sourceName: sourceLabel,
        }),
      })
      const payload = (await readJsonResponse(response)) as
        | {
            preview?: CsvImportTransactionPreview
            previewToken?: string
            error?: string
            sourceName?: string
          }
        | null

      if (!response.ok || !payload?.preview || !payload.previewToken) {
        setPreviewStatus('error')
        setPreviewToken(null)
        setServerPreview(null)
        setPreviewFeedback(payload?.error ?? 'Não foi possível validar o preview no servidor.')
        return
      }

      setServerPreview(payload.preview)
      setPreviewToken(payload.previewToken)
      setSourceLabel(payload.sourceName ?? sourceLabel)
      setPreviewStatus('success')
      setPreviewFeedback(
        payload.preview.readyToCommit
          ? 'Preview validado no servidor. A importação já pode ser confirmada.'
          : 'Preview validado no servidor. Ainda existem pendências antes da confirmação.',
      )
    } catch {
      setPreviewStatus('error')
      setPreviewToken(null)
      setServerPreview(null)
      setPreviewFeedback('Não foi possível validar o preview no servidor.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canConfirm || !previewToken) {
      return
    }

    setCommitStatus('loading')
    setCommitFeedback(null)
    setCommitDetails([])

    try {
      const response = await fetch('/api/imports/transactions/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previewToken,
          acceptedDuplicateLineNumbers: [],
          categoryMappings: [],
        }),
      })
      const payload = (await readJsonResponse(response)) as CommitResponse | null

      if (!response.ok) {
        setCommitStatus('error')
        setCommitFeedback(payload?.error ?? 'Não foi possível concluir a importação.')
        setCommitDetails(buildCommitDetails(payload))
        return
      }

      const committedRows = payload?.committedRows ?? 0

      setCommitStatus('success')
      setCommitFeedback(
        committedRows === 1
          ? 'Importação concluída com sucesso. 1 linha foi enviada para persistência.'
          : `Importação concluída com sucesso. ${committedRows} linhas foram enviadas para persistência.`,
      )
    } catch {
      setCommitStatus('error')
      setCommitFeedback('Não foi possível concluir a importação.')
      setCommitDetails([])
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Importação CSV
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Revisão da importação CSV</h1>
            <CardDescription className="max-w-2xl text-base">
              Carregue um CSV, revise o preview e só então confirme a importação.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-300 bg-white/80 p-4 text-sm text-muted-foreground dark:border-emerald-900 dark:bg-slate-950/60">
            A confirmação só fica disponível depois da revisão do preview.
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-0">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Entrada do CSV</h2>
            <CardDescription>
              Envie um arquivo ou cole o conteúdo para gerar o preview imediato.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2 text-sm font-medium" htmlFor="csv-file">
              <span>Arquivo CSV</span>
              <div className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
                <FileUp className="h-5 w-5 text-muted-foreground" />
                <input
                  id="csv-file"
                  accept=".csv,text/csv"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
            </label>

            <label className="block space-y-2 text-sm font-medium" htmlFor="csv-text">
              <span>Ou cole o CSV aqui</span>
              <textarea
                id="csv-text"
                className="min-h-60 w-full rounded-xl border border-input bg-background p-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="type,description,value,categoryName,competenceDate,dueDate,status,fixed"
                value={csvText}
                onChange={handleCsvTextChange}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={preview.readyToCommit ? 'secondary' : 'outline'}>
                {preview.readyToCommit ? 'Preview limpo' : 'Preview com pendências'}
              </Badge>
              <Badge variant={serverPreview ? 'secondary' : 'outline'}>
                {serverPreview ? 'Preview sincronizado com servidor' : 'Preview local'}
              </Badge>
              <span>Fonte: {sourceLabel}</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={!canValidatePreview} type="button" onClick={handlePreviewSync}>
                {previewStatus === 'loading' ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Validar preview no servidor
              </Button>
              <p className="flex-1 text-sm text-muted-foreground">
                Nenhuma linha será persistida antes da revisão limpa e da confirmação explícita.
              </p>
            </div>

            {previewFeedback ? (
              <div
                className={
                  previewStatus === 'error'
                    ? 'rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                    : 'rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                }
              >
                {previewFeedback}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Checklist de revisão</h2>
            <CardDescription>
              A confirmação só é liberada quando não restarem pendências no preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Válidas</p>
                <p className="mt-1 text-2xl font-semibold">{formatCount(preview.summary.readyRows, 'linha válida', 'linhas válidas')}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Inválidas</p>
                <p className="mt-1 text-2xl font-semibold">{formatCount(preview.summary.invalidRows, 'linha inválida', 'linhas inválidas')}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Categorias</p>
                <p className="mt-1 text-2xl font-semibold">{formatCount(preview.summary.missingCategoryRows, 'categoria pendente', 'categorias pendentes')}</p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Duplicidades</p>
                <p className="mt-1 text-2xl font-semibold">{formatCount(preview.summary.duplicateRows, 'duplicidade possível', 'duplicidades possíveis')}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              {buildDefaultNotice(preview, reviewAcknowledged, previewToken)}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4 text-sm">
                <input
                  aria-label="Revisei o preview e confirmo que os dados estão prontos"
                  checked={reviewAcknowledged}
                  className="mt-1 h-4 w-4 rounded border-input"
                  type="checkbox"
                  onChange={(event) => {
                    setReviewAcknowledged(event.target.checked)
                    setCommitStatus('idle')
                    setCommitFeedback(null)
                    setCommitDetails([])
                  }}
                />
                <span>
                  Eu revisei o preview, conferi as pendências e quero liberar a confirmação da
                  importação.
                </span>
              </label>

              <Button className="w-full" disabled={!canConfirm} type="submit">
                {commitStatus === 'loading' ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Confirmar importação
              </Button>

              {commitFeedback ? (
                <div
                  className={
                    commitStatus === 'error'
                      ? 'space-y-2 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                      : 'rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                  }
                >
                  <p>{commitFeedback}</p>
                  {commitDetails.length > 0 ? (
                    <div className="space-y-1">
                      {commitDetails.map((detail) => (
                        <p key={detail}>{detail}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-0">
          <CardHeader>
            <h2 className="text-lg font-semibold tracking-tight">Preview das linhas válidas</h2>
            <CardDescription>
              {formatCount(preview.validRows.length, 'lançamento pronto', 'lançamentos prontos')}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.validRows.length > 0 ? (
              preview.validRows.map((row) => (
                <div
                  key={rowKey(row)}
                  className="rounded-2xl border bg-background/80 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{row.transaction.description}</strong>
                    <Badge variant="secondary">{row.transaction.status}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {row.transaction.categoryName} · {row.transaction.type} · linha {row.line}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma linha válida para liberar.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="p-0">
            <CardHeader>
              <h2 className="text-lg font-semibold tracking-tight">Linhas inválidas</h2>
              <CardDescription>
                Linhas com dados incompletos ou inconsistentes são barradas antes da confirmação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {preview.invalidRows.length > 0 ? (
                preview.invalidRows.map((row) => (
                  <div key={rowKey(row)} className="rounded-2xl border bg-background/80 p-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <strong>{row.transaction.description || `Linha ${row.line}`}</strong>
                      <Badge variant="outline">Bloqueada</Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {row.issues.map((issue) => issue.message).join(' · ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma linha inválida detectada.</p>
              )}
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader>
              <h2 className="text-lg font-semibold tracking-tight">Categorias e duplicidades</h2>
              <CardDescription>
                O preview também mostra o que ainda precisa de mapeamento ou revisão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Categorias pendentes</p>
                <div className="mt-3 space-y-2">
                  {preview.pendingCategoryMappings.length > 0 ? (
                    preview.pendingCategoryMappings.map((mapping) => (
                      <div
                        key={mapping.sourceName}
                        className="rounded-2xl border bg-background/80 p-4 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong>{mapping.sourceName}</strong>
                          <Badge variant="outline">Mapeamento pendente</Badge>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                          {formatSuggestedCategories(mapping.suggestedCategoryIds, availableCategories)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma categoria pendente.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Possíveis duplicidades</p>
                <div className="mt-3 space-y-2">
                  {preview.possibleDuplicates.length > 0 ? (
                    preview.possibleDuplicates.map((duplicate) => (
                      <div
                        key={`${duplicate.lineNumber}-${duplicate.reason}`}
                        className="rounded-2xl border bg-background/80 p-4 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong>Linha {duplicate.lineNumber}</strong>
                          <Badge variant="outline">Duplicidade</Badge>
                        </div>
                        <p className="mt-2 text-muted-foreground">{duplicate.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma duplicidade detectada.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

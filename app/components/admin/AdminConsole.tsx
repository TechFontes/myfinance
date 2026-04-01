'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type AdminUserRecord = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  status: 'ACTIVE' | 'BLOCKED'
  blockedAt: string | null
  blockedReason: string | null
  financialSummary: {
    consolidatedBalance: string
    forecastBalance: string
    realizedBalance: string
    pendingCount: number
  }
}

type AdminConsoleProps = {
  users: AdminUserRecord[]
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  })
}

export function AdminConsole({ users }: AdminConsoleProps) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '')

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0] ?? null

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm">
        <CardHeader className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
            Acesso restrito
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Área administrativa técnica</h1>
            <CardDescription className="max-w-2xl text-base text-slate-200">
              Área separada do dashboard do usuário final, com leitura financeira somente leitura.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-0">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Usuários da plataforma</h2>
            <CardDescription>
              Ações administrativas ficam visíveis aqui; os dados financeiros permanecem em modo de leitura.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="align-top">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <p>{user.name}</p>
                        <p className="text-xs text-muted-foreground">ID {user.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'BLOCKED' ? 'outline' : 'secondary'}>
                        {user.status === 'BLOCKED' ? 'Bloqueado' : 'Ativo'}
                      </Badge>
                      {user.status === 'BLOCKED' ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Bloqueado desde {formatDate(user.blockedAt)}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          Ver leitura de {user.name}
                        </Button>
                        <Button size="sm" type="button">
                          {user.status === 'BLOCKED' ? `Desbloquear ${user.name}` : `Bloquear ${user.name}`}
                        </Button>
                        <Button size="sm" variant="ghost" type="button">
                          Editar cadastro de {user.name}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Leitura financeira</h2>
              <Badge variant="outline">Somente leitura</Badge>
            </div>
            <CardDescription>
              O painel mostra a visão consolidada do usuário selecionado sem permitir edição.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {selectedUser ? (
              <>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Usuário selecionado</p>
                  <h3 className="mt-1 text-2xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Saldo consolidado</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatCurrency(selectedUser.financialSummary.consolidatedBalance)}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Previsto</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatCurrency(selectedUser.financialSummary.forecastBalance)}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Realizado</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatCurrency(selectedUser.financialSummary.realizedBalance)}
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Pendências</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {selectedUser.financialSummary.pendingCount} itens
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  {selectedUser.status === 'BLOCKED'
                    ? `Bloqueado desde ${formatDate(selectedUser.blockedAt)}${selectedUser.blockedReason ? ` · ${selectedUser.blockedReason}` : ''}`
                    : 'Usuário ativo e disponível para operações administrativas.'}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum usuário disponível para leitura.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

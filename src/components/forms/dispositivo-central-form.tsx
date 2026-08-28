"use client"

import { useState, useEffect } from "react"
import {
  Siren, Flame, Thermometer, Volume2, Hand, Zap, Ban,
  Save, Trash2, X, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import {
  getDispositivoById, updateDispositivo,
  createDispositivo, deleteDispositivo
} from "@/app/actions/centrais"
import { cn } from "@/lib/utils"

// ─── Tipos ────────────────────────────────────────────────────────────────────
const TIPOS_OPCOES = [
  { value: "Tipo 01 - Fonte de Alimentação",        label: "Tipo 01 — Fonte de Alimentação",        icon: Zap },
  { value: "Tipo 02 - Acionador manual endereçável", label: "Tipo 02 — Acionador Manual",           icon: Hand },
  { value: "Tipo 03 - Detector de fumaça endereçável", label: "Tipo 03 — Detector de Fumaça",      icon: Flame },
  { value: "Tipo 05 - Detector térmico",             label: "Tipo 05 — Detector Térmico",          icon: Thermometer },
  { value: "Tipo 06 - Sirene endereçável",           label: "Tipo 06 — Sirene Endereçável",        icon: Volume2 },
  { value: "Tipo 37 - Sirene endereçável",           label: "Tipo 37 — Sirene Endereçável",        icon: Volume2 },
  { value: "Tipo 00 - Desabilitar dispositivo",      label: "Tipo 00 — Desabilitar dispositivo",   icon: Ban },
]

function TipoIcon({ tipo }: { tipo: string }) {
  const opt = TIPOS_OPCOES.find(o => o.value === tipo)
  const Icon = opt?.icon ?? Siren
  return <Icon className="w-4 h-4" />
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  id: string | null           // null = criação
  centralId?: string          // necessário para criação
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  perfil: string
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
export function DispositivoCentralDrawer({
  id, centralId, open, onClose, onSuccess, userId, perfil
}: Props) {
  const isNew = !id

  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Campos
  const [enderecoId, setEnderecoId]         = useState("")
  const [tipo, setTipo]                     = useState("Tipo 03 - Detector de fumaça endereçável")
  const [local, setLocal]                   = useState("")
  const [textoNaCentral, setTextoNaCentral] = useState("")
  const [zona, setZona]                     = useState("00")
  const [statusVal, setStatusVal]           = useState("Ativo")
  const [observacoes, setObservacoes]       = useState("")

  // Carrega dispositivo existente
  useEffect(() => {
    if (!open) return
    setError(null)
    setConfirmDelete(false)

    if (isNew) {
      setEnderecoId("")
      setTipo("Tipo 03 - Detector de fumaça endereçável")
      setLocal("")
      setTextoNaCentral("")
      setZona("00")
      setStatusVal("Ativo")
      setObservacoes("")
      return
    }

    setLoading(true)
    getDispositivoById(id!).then(res => {
      if (res.success && res.data) {
        const d = res.data
        setEnderecoId(d.enderecoId)
        setTipo(d.tipo)
        setLocal(d.local ?? "")
        setTextoNaCentral(d.textoNaCentral ?? "")
        setZona(d.zona ?? "00")
        setStatusVal(d.status)
        setObservacoes(d.observacoes ?? "")
      }
      setLoading(false)
    })
  }, [open, id, isNew])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const fd = new FormData()
    fd.append("userId", userId)
    if (isNew) fd.append("centralId", centralId!)
    fd.append("enderecoId", enderecoId)
    fd.append("tipo", tipo)
    fd.append("local", local)
    fd.append("textoNaCentral", textoNaCentral)
    fd.append("zona", zona)
    fd.append("status", statusVal)
    fd.append("observacoes", observacoes)

    const res = isNew
      ? await createDispositivo(fd)
      : await updateDispositivo(id!, fd)

    if (res.success) {
      onSuccess()
      onClose()
    } else {
      setError(res.error ?? "Erro ao salvar.")
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const res = await deleteDispositivo(id!, userId)
    if (res.success) {
      onSuccess()
      onClose()
    } else {
      setError(res.error ?? "Erro ao excluir.")
      setDeleting(false)
    }
  }

  const canEdit = perfil !== "Gestor"
  const canDelete = perfil === "Administrador"

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              statusVal === "Ativo" ? "bg-[#B11226]/10" : "bg-slate-100"
            )}>
              <Siren className={cn("h-5 w-5", statusVal === "Ativo" ? "text-[#B11226]" : "text-slate-400")} />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                {isNew ? "Novo Dispositivo" : `Dispositivo E${enderecoId}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isNew ? "Cadastro manual de dispositivo na central" : "Detalhes e edição do dispositivo"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[65vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-[#B11226] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Status — destaque */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-black text-slate-700">Status na Central</span>
                <div className="flex gap-2">
                  {["Ativo", "Desabilitado"].map(s => (
                    <button
                      key={s}
                      disabled={!canEdit}
                      onClick={() => setStatusVal(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-black transition-all border",
                        statusVal === s && s === "Ativo"   && "bg-emerald-500 text-white border-emerald-500",
                        statusVal === s && s === "Desabilitado" && "bg-slate-500 text-white border-slate-500",
                        statusVal !== s && "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endereço ID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Endereço ID
                  </Label>
                  <Input
                    value={enderecoId}
                    onChange={e => setEnderecoId(e.target.value)}
                    disabled={!isNew}
                    placeholder="001"
                    className="rounded-xl border-slate-200 h-10 text-sm font-mono font-bold disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Zona / Grupo
                  </Label>
                  <Input
                    value={zona}
                    onChange={e => setZona(e.target.value)}
                    disabled={!canEdit}
                    placeholder="00"
                    className="rounded-xl border-slate-200 h-10 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Tipo / Equipamento
                </Label>
                <Select value={tipo} onValueChange={(v) => { if (v) setTipo(v) }} disabled={!canEdit}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-10 text-sm">
                    <div className="flex items-center gap-2">
                      <TipoIcon tipo={tipo} />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_OPCOES.map(o => (
                      <SelectItem key={o.value} value={o.value}>
                        <div className="flex items-center gap-2">
                          <o.icon className="w-4 h-4" />
                          {o.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Local */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Local / Ambiente
                </Label>
                <Input
                  value={local}
                  onChange={e => setLocal(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Embalagem Secundária"
                  className="rounded-xl border-slate-200 h-10 text-sm"
                />
              </div>

              {/* Texto na Central */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Texto na Central
                </Label>
                <Input
                  value={textoNaCentral}
                  onChange={e => setTextoNaCentral(e.target.value)}
                  disabled={!canEdit}
                  placeholder="DET FUMACA EMBALAGEM SECUNDARIA 003"
                  className="rounded-xl border-slate-200 h-10 text-sm font-mono"
                />
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Observações
                </Label>
                <Textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Vídeo da central, instruções de comissionamento..."
                  rows={3}
                  className="rounded-xl border-slate-200 text-sm resize-none"
                />
              </div>

              {/* Confirmação de exclusão */}
              {confirmDelete && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  ⚠️ Clique em <strong>Excluir</strong> novamente para confirmar a exclusão permanente.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {canDelete && !isNew ? (
            <Button
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className={cn(
                "rounded-xl h-9 text-xs font-black border transition-all",
                confirmDelete
                  ? "border-red-500 text-red-600 hover:bg-red-50"
                  : "border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500"
              )}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {deleting ? "Excluindo..." : confirmDelete ? "Confirmar Exclusão" : "Excluir"}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl h-9 text-xs border-slate-200"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Fechar
            </Button>
            {canEdit && (
              <Button
                size="sm"
                disabled={saving || loading}
                onClick={handleSave}
                className="bg-[#B11226] hover:bg-[#9a0f1f] text-white rounded-xl h-9 text-xs font-black px-5"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

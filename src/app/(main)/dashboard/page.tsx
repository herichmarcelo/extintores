"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Flame,
  Droplets,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Loader2,
  AlertTriangle,
  Clock,
  ClipboardCheck,
  Shield,
  ChevronRight,
  Map as MapIcon,
  X,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getDashboardData } from "@/app/actions/extintores";
import { BottomNavigation } from "@/components/BottomNavigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@700;800&display=swap');";

const COLORS = {
  red: "#ff1744",
  orange: "#ff6d00",
  green: "#00e676",
  blue: "#2979ff",
  amber: "#ffc400",
  purple: "#7c4dff",
};

const displayFont = { fontFamily: "'Archivo Black', sans-serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

function GlowCard({ children, glow, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{ boxShadow: `0 10px 30px ${glow}22` }}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: glow }}
      />
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, tag, glow }) {
  return (
    <GlowCard glow={glow} className="animate-card p-5">
      <div className="relative z-10 flex items-start justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</span>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
          <Icon className="h-5 w-5" style={{ color: glow }} />
        </div>
      </div>
      <div className="relative z-10 mt-3 text-3xl font-bold text-slate-900 md:text-4xl" style={monoFont}>
        {value}
      </div>
      {tag && (
        <span
          className="relative z-10 mt-3 inline-block rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white"
          style={{ backgroundColor: glow }}
        >
          {tag}
        </span>
      )}
    </GlowCard>
  );
}

function PressureGauge({ percent, glow }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const cx = 100;
  const cy = 92;
  const toXY = (radius, pct) => {
    const angle = 180 - (pct / 100) * 180;
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };
  const arc = (radius, pctStart, pctEnd) => {
    const s = toXY(radius, pctStart);
    const e = toXY(radius, pctEnd);
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 0 1 ${e.x} ${e.y}`;
  };
  const needle = toXY(58, clamped);
  const ticks = [0, 50, 100].map((p) => ({ p, outer: toXY(88, p), inner: toXY(80, p) }));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 106" style={{ width: "100%", maxWidth: 280 }}>
        <path d={arc(84, 0, 100)} stroke="#e2e8f0" strokeWidth="18" fill="none" />
        <path d={arc(76, 0, 40)} stroke={COLORS.red} strokeWidth="13" fill="none" />
        <path d={arc(76, 40, 60)} stroke={COLORS.amber} strokeWidth="13" fill="none" />
        <path d={arc(76, 60, 100)} stroke={COLORS.green} strokeWidth="13" fill="none" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y} stroke="#64748b" strokeWidth="2" />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="#1e293b"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: "all 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
        <circle cx={cx} cy={cy} r="6" fill="#1e293b" />
        <circle cx={cx} cy={cy} r="2.5" fill="white" />
      </svg>
      <div className="-mt-2">
        <span className="text-4xl font-bold md:text-5xl" style={{ ...monoFont, color: glow }}>
          {clamped}
        </span>
        <span className="text-xl font-bold" style={{ ...monoFont, color: glow }}>%</span>
      </div>
    </div>
  );
}

function EfficiencyGauge({ title, subtitle, percent, aprovados, reprovados, glow, onGerenciarClick }) {
  return (
    <GlowCard glow={glow} className="animate-card p-6">
      <div className="relative z-10">
        <h3 className="text-lg font-black text-slate-800 md:text-xl">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>
      <div className="relative z-10 mt-2 flex justify-center">
        <PressureGauge percent={percent} glow={glow} />
      </div>
      <div className="relative z-10 mt-2 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.green }} />
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Conforme</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800" style={monoFont}>{aprovados}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.red }} />
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Crítico</span>
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800" style={monoFont}>{reprovados}</div>
        </div>
      </div>
      <button
        onClick={onGerenciarClick}
        className="mt-6 w-full py-3 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
        style={{ backgroundColor: `${glow}15`, color: glow, border: `1px solid ${glow}30` }}
      >
        Gerenciar <ChevronRight className="w-4 h-4" />
      </button>
    </GlowCard>
  );
}

function UnitBarChart({ data, tipo, glowConforme, glowNaoConforme }) {
  const keyConforme = tipo === "extintores" ? "conformeExtintores" : "conformeHidrantes";
  const keyNaoConforme = tipo === "extintores" ? "naoConformeExtintores" : "naoConformeHidrantes";
  return (
    <GlowCard glow={glowConforme} className="animate-card p-6">
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 md:text-xl">Conformidade por Unidade</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {tipo === "extintores" ? "Extintores" : "Hidrantes"} aprovados vs. reprovados
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <MapIcon className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      <div className="relative z-10" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight={800} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#94a3b8" fontSize={12} fontWeight={800} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip
              cursor={{ fill: "#f1f5f9", opacity: 0.4 }}
              contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", fontWeight: "bold" }}
            />
            <Bar dataKey={keyConforme} name="Conforme" fill={glowConforme} radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey={keyNaoConforme} name="Não Conforme" fill={glowNaoConforme} radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlowCard>
  );
}

function CoverageBar({ label, value, total, glow }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <GlowCard glow={glow} className="animate-card p-6">
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-sm font-black uppercase tracking-wide text-slate-700">{label}</span>
        <span className="text-lg font-bold" style={{ ...monoFont, color: glow }}>{pct}%</span>
      </div>
      <div className="relative z-10 mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: glow }} />
      </div>
      <p className="relative z-10 mt-2 text-xs font-bold text-slate-500">
        {value} de {total} hidrantes já inspecionados
      </p>
    </GlowCard>
  );
}

function AlertBanner({ count, onClick }) {
  if (!count) return null;
  return (
    <button
      onClick={onClick}
      className="animate-card flex w-full items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 md:p-5"
    >
      <div className="shrink-0 rounded-xl bg-amber-400 p-2.5">
        <AlertTriangle className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-slate-900 md:text-base">
          {count} equipamentos com inspeção vencida ou pendente
        </p>
        <p className="text-xs font-semibold text-slate-600 md:text-sm">Toque para ver os detalhes</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-amber-500" />
    </button>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("extintores");
  const [showCriticos, setShowCriticos] = useState(false);
  const router = useRouter();

  const loadImageAsBase64 = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
      return "";
    }
  };

  const gerarRelatorioCriticos = async () => {
    if (!data) return;

    try {
      const doc = new jsPDF();
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const logoBase64 = await loadImageAsBase64('/novalogo.png');

      if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Equipamentos Críticos", 14, 35);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataAtual} | Total: ${data.criticos.length} equipamentos`, 14, 42);

      const tableData = data.criticos.map(item => [
        item.tipo,
        item.codigo || item.id,
        item.localizacao || "Local não registrado",
        item.unidade?.nome || "Unidade não registrada"
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Tipo', 'Código/ID', 'Localização', 'Unidade']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] }
      });

      doc.save(`relatorio-criticos-${dataAtual.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Ocorreu um erro ao processar o arquivo PDF.");
    }
  };

  useEffect(() => {
    async function loadData() {
      const result = await getDashboardData();
      setData(result);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    );
  }

  const totalEquipamentos = data.totalExtintores + data.totalHidrantes;
  const totalAprovados = data.aprovadosExtintores + data.aprovadosHidrantes;
  const conformidadeGeral = totalEquipamentos > 0 ? Math.round((totalAprovados / totalEquipamentos) * 100) : 0;
  const totalNaoConformes = data.reprovadosExtintores + data.reprovadosHidrantes;
  const hidrantesInspecionados = data.totalHidrantes - data.reprovadosHidrantes;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:space-y-8 md:p-8 pb-24">
      <style>{`
        ${FONT_IMPORT}
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeInUp 0.5s ease-out both; }
        .stagger-grid > *:nth-child(1) { animation-delay: .05s; }
        .stagger-grid > *:nth-child(2) { animation-delay: .1s; }
        .stagger-grid > *:nth-child(3) { animation-delay: .15s; }
        .stagger-grid > *:nth-child(4) { animation-delay: .2s; }
        @media (prefers-reduced-motion: reduce) {
          .animate-card { animation: none; }
        }
      `}</style>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl text-transparent md:text-4xl" style={{ ...displayFont, WebkitTextStroke: "0.5px transparent", backgroundImage: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.orange})`, WebkitBackgroundClip: "text", backgroundClip: "text" }}>
            DASHBOARD
          </h1>
          <p className="mt-1 text-base font-bold uppercase tracking-widest text-slate-500 md:text-lg">
            Bello Alimentos
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-full border border-red-100 bg-white px-5 py-2.5 md:px-6 md:py-3">
          <Activity className="h-4 w-4 animate-pulse text-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 md:text-sm">Sistema Operativo</span>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
      </div>

      {totalNaoConformes > 0 && (
        <AlertBanner count={totalNaoConformes} onClick={() => setShowCriticos(true)} />
      )}

      <div className="stagger-grid grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <StatCard icon={Shield} title="Total Equipamentos" value={totalEquipamentos} tag="Ativo" glow={COLORS.orange} />
        <StatCard icon={CheckCircle2} title="Conformidade Geral" value={`${conformidadeGeral}%`} tag="Média" glow={COLORS.green} />
        <StatCard icon={Clock} title="Críticos" value={totalNaoConformes} tag="Atenção" glow={COLORS.amber} />
        <StatCard icon={ShieldAlert} title="Itens Não Conformes" value={totalNaoConformes} tag="Crítico" glow={COLORS.red} />
      </div>

      <div className="inline-flex rounded-2xl bg-slate-100 p-1.5">
        <button
          onClick={() => setActiveTab("extintores")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 md:px-6 md:text-sm ${
            activeTab === "extintores" ? "bg-white text-red-600 shadow" : "text-slate-500"
          }`}
        >
          <Flame className="h-4 w-4" /> Extintores
        </button>
        <button
          onClick={() => setActiveTab("hidrantes")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 md:px-6 md:text-sm ${
            activeTab === "hidrantes" ? "bg-white text-blue-600 shadow" : "text-slate-500"
          }`}
        >
          <Droplets className="h-4 w-4" /> Hidrantes
        </button>
      </div>

      {activeTab === "extintores" ? (
        <div className="space-y-6 md:space-y-8">
          <div className="stagger-grid grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            <StatCard icon={Flame} title="Total Extintores" value={data.totalExtintores} tag="Ativo" glow={COLORS.orange} />
            <StatCard icon={CheckCircle2} title="Aprovados" value={data.aprovadosExtintores} tag="Conforme" glow={COLORS.green} />
            <StatCard icon={ShieldAlert} title="Reprovados" value={data.reprovadosExtintores} tag="Crítico" glow={COLORS.red} />
            <StatCard icon={CheckCircle2} title="Taxa de Eficiência" value={`${data.taxaEficienciaExtintores}%`} tag="Geral" glow={COLORS.green} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <UnitBarChart data={data.dataPorUnidade} tipo="extintores" glowConforme={COLORS.green} glowNaoConforme={COLORS.red} />
            <EfficiencyGauge
              title="Taxa de Eficiência"
              subtitle="Extintores conformes vs. não conformes"
              percent={data.taxaEficienciaExtintores}
              aprovados={data.aprovadosExtintores}
              reprovados={data.reprovadosExtintores}
              glow={COLORS.orange}
              onGerenciarClick={() => router.push("/extintores")}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          <div className="stagger-grid grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            <StatCard icon={Droplets} title="Total Hidrantes" value={data.totalHidrantes} tag="Ativo" glow={COLORS.blue} />
            <StatCard icon={ClipboardCheck} title="Inspecionados" value={hidrantesInspecionados} tag="Checados" glow={COLORS.purple} />
            <StatCard icon={Clock} title="Críticos" value={data.reprovadosHidrantes} tag="Atenção" glow={COLORS.amber} />
            <StatCard icon={CheckCircle2} title="Taxa de Eficiência" value={`${data.taxaEficienciaHidrantes}%`} tag="Geral" glow={COLORS.green} />
          </div>
          <CoverageBar label="Cobertura de Inspeção" value={hidrantesInspecionados} total={data.totalHidrantes} glow={COLORS.purple} />
          <div className="grid gap-6 lg:grid-cols-2">
            <UnitBarChart data={data.dataPorUnidade} tipo="hidrantes" glowConforme={COLORS.blue} glowNaoConforme={COLORS.red} />
            <EfficiencyGauge
              title="Taxa de Eficiência"
              subtitle="Hidrantes conformes vs. não conformes"
              percent={data.taxaEficienciaHidrantes}
              aprovados={data.aprovadosHidrantes}
              reprovados={data.reprovadosHidrantes}
              glow={COLORS.blue}
              onGerenciarClick={() => router.push("/hidrantes")}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCriticos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCriticos(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900">Equipamentos Críticos</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={gerarRelatorioCriticos}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => setShowCriticos(false)}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {data.criticos.map((item, i) => (
                  <GlowCard
                    key={i}
                    glow={item.tipo === "Extintor" ? COLORS.orange : COLORS.blue}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${item.tipo === "Extintor" ? COLORS.orange : COLORS.blue}15` }}>
                        {item.tipo === "Extintor" ? <Flame className="w-6 h-6" style={{ color: COLORS.orange }} /> : <Droplets className="w-6 h-6" style={{ color: COLORS.blue }} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.tipo}: {item.codigo || item.id}</p>
                        <p className="text-sm text-slate-500">{item.localizacao || "Local não registrado"}</p>
                        {item.unidade && <p className="text-xs text-slate-400">{item.unidade.nome}</p>}
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white" style={{ backgroundColor: COLORS.red }}>
                      Crítico
                    </div>
                  </GlowCard>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

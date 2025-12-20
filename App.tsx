import React, { useState, useMemo } from 'react';
import { FilterState } from './types';
import { 
  CURVED_PANEL_DATA, CURVED_SPANS,
  FLAT_PANEL_DATA, FLAT_SPANS,
  PENTA_PANEL_DATA,
  CURVED_ROCK_PANEL_DATA, CURVED_ROCK_SPANS,
  FLAT_ROCK_PANEL_DATA, FLAT_ROCK_SPANS
} from './services/data';
import { DataTable } from './components/DataTable';
import { LoadChart } from './components/LoadChart';
import { AIChat } from './components/AIChat';
import { 
  FileSpreadsheet, Ruler, MessageCircle, Info, LayoutTemplate, BoxSelect, 
  Github, Grid3x3, CircleDot, Square, ArrowUpFromLine, ArrowDownToLine, 
  ExternalLink, Share2, Printer, Download, Save, RefreshCw, Check
} from 'lucide-react';

const App: React.FC = () => {
  const [panelType, setPanelType] = useState<'curved' | 'flat' | 'penta' | 'rock' | 'flat_rock'>('curved');
  const [filters, setFilters] = useState<FilterState>({
    thickness: 'all',
    steelExt: 'all',
    steelInt: 'all',
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const { currentData, currentSpans, title, configInfo } = useMemo(() => {
    const configs = {
      curved: { data: CURVED_PANEL_DATA, spans: CURVED_SPANS, title: "Curvi EPS", info: "EPS Curvo" },
      flat: { data: FLAT_PANEL_DATA, spans: FLAT_SPANS, title: "Piani EPS", info: "EPS Piano" },
      penta: { data: PENTA_PANEL_DATA, spans: CURVED_SPANS, title: "Penta Flagon", info: "Penta Flagon SW" },
      rock: { data: CURVED_ROCK_PANEL_DATA, spans: CURVED_ROCK_SPANS, title: "Curvo Rock", info: "Lana di Roccia Curvo" },
      flat_rock: { data: FLAT_ROCK_PANEL_DATA, spans: FLAT_ROCK_SPANS, title: "Piano Rock", info: "Lana di Roccia Piano" }
    };
    const c = configs[panelType];
    return { currentData: c.data, currentSpans: c.spans, title: c.title, configInfo: c.info };
  }, [panelType]);

  const filterOptions = useMemo(() => {
    const getUnique = (key: keyof typeof currentData[0]) => 
      // Fix: Explicitly type sort parameters as numbers to resolve "left-hand side of an arithmetic operation" error
      Array.from(new Set(currentData.map(d => d[key] as number))).sort((a: number, b: number) => a - b);
    return {
      thicknesses: getUnique('thickness'),
      steelExts: getUnique('steelExt'),
      steelInts: getUnique('steelInt')
    };
  }, [currentData]);

  const filteredData = useMemo(() => {
    return currentData.filter((panel) => {
      const matchThickness = filters.thickness === 'all' || panel.thickness === filters.thickness;
      const matchSteelExt = filters.steelExt === 'all' || panel.steelExt === filters.steelExt;
      const matchSteelInt = filters.steelInt === 'all' || panel.steelInt === filters.steelInt;
      return matchThickness && matchSteelExt && matchSteelInt;
    });
  }, [filters, currentData]);

  const handleTypeChange = (type: typeof panelType) => {
    setPanelType(type);
    setFilters({ thickness: 'all', steelExt: 'all', steelInt: 'all' });
  };

  const handlePrint = () => window.print();
  const handleReload = () => window.location.reload();
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SW Calculator', url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiato negli appunti!");
    }
  };

  const handleDownloadCSV = () => {
    const headers = ["Spessore", "Est", "Int", "Peso", "Trasm", ...currentSpans.map(s => `Luce ${s}`)];
    const rows = filteredData.map(row => [
      row.thickness, row.steelExt, row.steelInt, row.weight, row.transmittance || '-',
      ...currentSpans.map(span => row.loads[span] ?? '')
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `portate_${panelType}.csv`);
    link.click();
  };

  const handleSave = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500 selection:text-white flex flex-col pb-32 sm:pb-28 print:pb-0 overflow-x-hidden">
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white; color: black; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Credit Banner */}
      <div className="bg-slate-900 border-b border-blue-900/30 py-2 text-center no-print">
        <p className="text-[11px] sm:text-sm text-blue-300 flex items-center justify-center gap-1">
          Developed by <a href="https://www.efremgiannessi.org" target="_blank" className="text-white font-bold underline">Efrem Giannessi</a>
        </p>
      </div>

      {/* Header */}
      <nav className="bg-slate-900/90 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-30 no-print">
        <div className="max-w-full px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">Portate SW</h1>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-tighter block">EPS & Rock Panels</span>
            </div>
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isChatOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden xs:inline">AI Assistant</span>
          </button>
        </div>
      </nav>

      <main className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-grow">
        
        {/* Panel Type Selector (Horizontal Scroll) */}
        <div className="relative no-print">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 px-1 snap-x">
            {[
              { id: 'curved', icon: LayoutTemplate, label: 'Curvo EPS' },
              { id: 'flat', icon: BoxSelect, label: 'Piano EPS' },
              { id: 'penta', icon: Grid3x3, label: 'Penta' },
              { id: 'rock', icon: CircleDot, label: 'Curvo Rock' },
              { id: 'flat_rock', icon: Square, label: 'Piano Rock' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap snap-start border ${
                  panelType === type.id 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <type.icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
          {[
            { id: 'thickness', icon: Ruler, label: 'Spessore', options: filterOptions.thicknesses, suffix: 'mm' },
            { id: 'steelExt', icon: ArrowUpFromLine, label: 'Esterno', options: filterOptions.steelExts, suffix: 'mm' },
            { id: 'steelInt', icon: ArrowDownToLine, label: 'Interno', options: filterOptions.steelInts, suffix: 'mm' }
          ].map(f => (
            <div key={f.id} className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <f.icon className="h-4 w-4 text-slate-500" />
              </div>
              <select
                value={filters[f.id as keyof FilterState]}
                onChange={(e) => setFilters(prev => ({ ...prev, [f.id]: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="all">{f.label}: Tutti</option>
                {f.options.map(opt => <option key={opt} value={opt}>{opt} {f.suffix}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Config Summary */}
        <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-3 flex items-center gap-3 text-[11px] sm:text-xs text-blue-400 no-print">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span><strong>In uso:</strong> {configInfo} • <strong>Filtri attivi:</strong> {filteredData.length} varianti</span>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 print-black">
              <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
              Tabella {title} <span className="text-[10px] text-slate-500 ml-2">(kg/mq)</span>
            </h2>
            {filteredData.length > 0 ? (
              <DataTable data={filteredData} spans={currentSpans} />
            ) : (
              <div className="h-40 flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 text-slate-600">
                <p>Nessuna corrispondenza</p>
              </div>
            )}
          </div>

          <div className="xl:col-span-1 space-y-6 no-print">
            <LoadChart data={filteredData.slice(0, 5)} spans={currentSpans} />
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[10px] leading-relaxed text-slate-500">
              <p className="font-bold text-slate-400 mb-1">NOTE TECNICHE</p>
              Valori calcolati per appoggio semplice. Verificare le prescrizioni locali per carichi accidentali.
            </div>
          </div>
        </div>
      </main>

      {/* FIXED MOBILE TOOLBAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 no-print w-[94%] xs:w-auto">
        <div className="flex items-center justify-around xs:justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl ring-1 ring-white/5">
          {[
            { icon: Share2, action: handleShare, label: 'Condividi', color: 'hover:text-blue-400' },
            { icon: Printer, action: handlePrint, label: 'Stampa', color: 'hover:text-slate-200' },
            { icon: Download, action: handleDownloadCSV, label: 'Excel', color: 'hover:text-emerald-400' },
            { icon: Save, action: handleSave, label: 'Salva', color: 'hover:text-amber-400', special: saveStatus === 'saved' },
            { icon: RefreshCw, action: handleReload, label: 'Reset', color: 'hover:text-purple-400' }
          ].map((btn, i) => (
            <React.Fragment key={i}>
              <button 
                onClick={btn.action} 
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all text-slate-500 ${btn.color} active:scale-95`}
                title={btn.label}
              >
                {btn.special ? <Check className="w-5 h-5 text-emerald-500" /> : <btn.icon className="w-5 h-5" />}
                <span className="text-[8px] mt-1 font-medium hidden xs:block">{btn.label}</span>
              </button>
              {(i === 1 || i === 3) && <div className="w-px h-8 bg-slate-800 mx-0.5 sm:mx-1"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <footer className="py-6 sm:py-10 text-center no-print border-t border-slate-900">
        <a href="https://app.netlify.com/projects/sandwich-panel-load-capacities/deploys" target="_blank" className="inline-block opacity-70 hover:opacity-100 transition-opacity">
          <img src="https://api.netlify.com/api/v1/badges/7751a6dc-97d0-4a2d-a1aa-1f9cb96cfb1d/deploy-status" alt="Netlify" className="h-4 sm:h-5" />
        </a>
      </footer>

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} contextData={filteredData} />
    </div>
  );
};

export default App;
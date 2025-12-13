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

  // Derive current dataset and configuration based on panel type
  const { currentData, currentSpans, title, configInfo } = useMemo(() => {
    if (panelType === 'curved') {
      return {
        currentData: CURVED_PANEL_DATA,
        currentSpans: CURVED_SPANS,
        title: "Pannelli Curvi",
        configInfo: "EPS Curvo"
      };
    } else if (panelType === 'flat') {
      return {
        currentData: FLAT_PANEL_DATA,
        currentSpans: FLAT_SPANS,
        title: "Pannelli Piani",
        configInfo: "EPS Piano"
      };
    } else if (panelType === 'penta') {
      return {
        currentData: PENTA_PANEL_DATA,
        currentSpans: CURVED_SPANS,
        title: "Penta Flagon",
        configInfo: "Penta Flagon SW"
      };
    } else if (panelType === 'rock') {
      return {
        currentData: CURVED_ROCK_PANEL_DATA,
        currentSpans: CURVED_ROCK_SPANS,
        title: "Portate SW Curvo Rock",
        configInfo: "Lana di Roccia Curvo"
      };
    } else {
      return {
        currentData: FLAT_ROCK_PANEL_DATA,
        currentSpans: FLAT_ROCK_SPANS,
        title: "Portate SW Piano Rock",
        configInfo: "Lana di Roccia Piano"
      };
    }
  }, [panelType]);

  // Calculate available filter options dynamically based on current data
  const filterOptions = useMemo(() => {
    const thicknesses = Array.from(new Set(currentData.map(d => d.thickness))).sort((a: number, b: number) => a - b);
    const steelExts = Array.from(new Set(currentData.map(d => d.steelExt))).sort((a: number, b: number) => a - b);
    const steelInts = Array.from(new Set(currentData.map(d => d.steelInt))).sort((a: number, b: number) => a - b);
    return { thicknesses, steelExts, steelInts };
  }, [currentData]);

  const filteredData = useMemo(() => {
    return currentData.filter((panel) => {
      const matchThickness = filters.thickness === 'all' || panel.thickness === filters.thickness;
      const matchSteelExt = filters.steelExt === 'all' || panel.steelExt === filters.steelExt;
      const matchSteelInt = filters.steelInt === 'all' || panel.steelInt === filters.steelInt;
      return matchThickness && matchSteelExt && matchSteelInt;
    });
  }, [filters, currentData]);

  // Reset filters when switching panel type
  const handleTypeChange = (type: 'curved' | 'flat' | 'penta' | 'rock' | 'flat_rock') => {
    setPanelType(type);
    setFilters({ thickness: 'all', steelExt: 'all', steelInt: 'all' });
  };

  // --- ACTIONS ---

  const handlePrint = () => {
    window.print();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SW Calculator',
          text: 'Calcolatore Portate Pannelli Sandwich',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert("Copia il link dalla barra degli indirizzi per condividere!");
    }
  };

  const handleDownloadCSV = () => {
    // Generate Headers
    const headers = ["ID", "Spessore (mm)", "Acciaio Est (mm)", "Acciaio Int (mm)", "Peso (kg/m2)", "Trasmittanza", ...currentSpans.map(s => `Luce ${s}cm`)];
    
    // Generate Rows
    const rows = filteredData.map(row => [
      row.id,
      row.thickness,
      row.steelExt,
      row.steelInt,
      row.weight,
      row.transmittance || '-',
      ...currentSpans.map(span => row.loads[span] !== null && row.loads[span] !== undefined ? row.loads[span] : '')
    ]);

    // Combine and convert to CSV format
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `portate_${panelType}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    // Mock save functionality
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500 selection:text-white flex flex-col pb-28 print:pb-0">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; color: black !important; }
          .print-black { color: black !important; }
        }
      `}</style>

      {/* Top Credit Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 border-b border-blue-800/50 py-2.5 text-center relative overflow-hidden no-print">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <p className="text-sm text-blue-100 font-medium relative z-10 flex items-center justify-center gap-2">
          Software progettato e sviluppato da 
          <a 
            href="https://www.efremgiannessi.org" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white font-bold hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-400 transition-all flex items-center gap-1"
          >
            Efrem Giannessi
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        </p>
      </div>

      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 no-print">
        <div className="w-full px-4 lg:px-6">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none">SW Calculator</h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">Sandwich panel load capacities</span>
              </div>
            </div>

            {/* Right Section: Status & Actions */}
            <div className="flex items-center gap-6">
              
              {/* Status Indicator (Simulated Image) */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Stato Sistema</span>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-bold text-white">Online & Ready</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                  isChatOpen 
                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' 
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full px-4 lg:px-6 py-6 space-y-6 flex-grow">

        {/* Top Control Bar */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg no-print">
          
          {/* Panel Type Selector */}
          <div className="bg-slate-950 p-1.5 rounded-xl flex shadow-inner w-full xl:w-auto overflow-x-auto">
            <button
              onClick={() => handleTypeChange('curved')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                panelType === 'curved' 
                  ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              SW Curvo EPS
            </button>
            <button
              onClick={() => handleTypeChange('flat')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                panelType === 'flat' 
                  ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <BoxSelect className="w-4 h-4" />
              SW Piano EPS
            </button>
            <button
              onClick={() => handleTypeChange('penta')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                panelType === 'penta' 
                  ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              Penta Flagon
            </button>
            <button
              onClick={() => handleTypeChange('rock')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                panelType === 'rock' 
                  ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <CircleDot className="w-4 h-4" />
              Curvo Rock
            </button>
            <button
              onClick={() => handleTypeChange('flat_rock')}
              className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                panelType === 'flat_rock' 
                  ? 'bg-slate-800 text-blue-400 shadow-sm ring-1 ring-slate-700' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Square className="w-4 h-4" />
              Piano Rock
            </button>
          </div>

          {/* Filters inline for desktop */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto px-2 pb-2 xl:pb-0">
             {/* Thickness Filter */}
             <div className="relative group w-full sm:w-40">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Ruler className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
               </div>
               <select
                 value={filters.thickness}
                 onChange={(e) => setFilters(prev => ({ ...prev, thickness: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                 className="block w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-700 bg-slate-800 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer transition-all hover:bg-slate-750"
               >
                 <option value="all">Spessore: Tutti</option>
                 {filterOptions.thicknesses.map(t => (
                   <option key={t} value={t}>{t} mm</option>
                 ))}
               </select>
             </div>

             {/* Steel Ext Filter */}
             <div className="relative group w-full sm:w-40">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <ArrowUpFromLine className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
               </div>
               <select
                 value={filters.steelExt}
                 onChange={(e) => setFilters(prev => ({ ...prev, steelExt: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                 className="block w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-700 bg-slate-800 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer transition-all hover:bg-slate-750"
               >
                 <option value="all">Esterno: Tutti</option>
                 {filterOptions.steelExts.map(s => (
                   <option key={s} value={s}>{s.toFixed(1)} mm</option>
                 ))}
               </select>
             </div>

             {/* Steel Int Filter */}
             <div className="relative group w-full sm:w-40">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <ArrowDownToLine className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
               </div>
               <select
                 value={filters.steelInt}
                 onChange={(e) => setFilters(prev => ({ ...prev, steelInt: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                 className="block w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-700 bg-slate-800 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer transition-all hover:bg-slate-750"
               >
                 <option value="all">Interno: Tutti</option>
                 {filterOptions.steelInts.map(s => (
                   <option key={s} value={s}>{s.toFixed(1)} mm</option>
                 ))}
               </select>
             </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="w-full bg-blue-900/20 border border-blue-900/50 rounded-xl p-3 flex items-center gap-3 text-sm text-blue-200 no-print">
           <Info className="w-4 h-4 flex-shrink-0 text-blue-400" />
           <p>
             <span className="font-semibold text-blue-400">Configurazione:</span> {configInfo}
           </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Table (Takes up 3/4 on large screens) */}
          <div className="xl:col-span-3 space-y-4">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 print-black">
                  <span className="w-2 h-6 bg-blue-500 rounded-full no-print"></span>
                  Tabella di Carico - {title}
                </h2>
                <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 shadow-sm no-print">
                  UNITÀ: Kg/mq
                </span>
             </div>
             
             {filteredData.length > 0 ? (
               <DataTable data={filteredData} spans={currentSpans} />
             ) : (
               <div className="h-96 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800 text-slate-500">
                 <FileSpreadsheet className="w-12 h-12 mb-4 opacity-50" />
                 <p className="text-lg font-medium">Nessun dato trovato</p>
                 <p className="text-sm">Prova a modificare i filtri di ricerca</p>
               </div>
             )}
          </div>

          {/* Chart & Stats (Takes up 1/4 on large screens) */}
          <div className="xl:col-span-1 space-y-6 no-print">
            <div className="space-y-4">
               <h2 className="text-xl font-bold text-white px-1">Analisi Grafica</h2>
               <LoadChart data={filteredData} spans={currentSpans} />
            </div>
            
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
               <div className="flex items-start gap-3">
                 <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                 <div className="text-sm text-amber-200/80">
                    <p className="font-bold text-amber-500 mb-1">Disclaimer Tecnico</p>
                    <p className="leading-relaxed text-xs">
                      Valori indicativi per carichi statici uniformemente distribuiti. 
                      Dimensionamento definitivo soggetto a verifica ingegneristica conforme NTC 2018.
                    </p>
                 </div>
               </div>
            </div>

            {/* GitHub/Netlify Badge (Visual only) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Repository Status</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" />
                  <span>main branch</span>
                </div>
                <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                <div className="text-emerald-500 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                   Netlify Ready
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Bottom Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print w-[90%] sm:w-auto">
        <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 p-2 sm:p-2.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl ring-1 ring-white/10">
          
          <button onClick={handleShare} className="group relative p-2.5 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-400">
            <Share2 className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">Condividi</span>
          </button>

          <button onClick={handlePrint} className="group relative p-2.5 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-400">
            <Printer className="w-5 h-5" />
             <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">Stampa / PDF</span>
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          <button onClick={handleDownloadCSV} className="group relative p-2.5 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-emerald-400">
            <Download className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">Scarica Excel</span>
          </button>

          <button onClick={handleSave} className="group relative p-2.5 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-amber-400">
            {saveStatus === 'saved' ? <Check className="w-5 h-5 text-emerald-500" /> : <Save className="w-5 h-5" />}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">Salva</span>
          </button>

           <div className="w-px h-6 bg-slate-700 mx-1"></div>

          <button onClick={handleReload} className="group relative p-2.5 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-purple-400">
            <RefreshCw className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">Ricarica</span>
          </button>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-auto py-8 no-print">
         <div className="w-full px-6 text-center">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} SW Calculator. Designed for modern engineering.
            </p>
         </div>
      </footer>

      {/* Chat Bot Overlay */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        contextData={filteredData}
      />
    </div>
  );
};

export default App;
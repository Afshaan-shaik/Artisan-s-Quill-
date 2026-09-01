import React, { useState } from 'react';
import {
  X,
  Database,
  Code2,
  Server,
  Layers,
  HardDrive,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Cpu,
  Table as TableIcon
} from 'lucide-react';
import { PYTHON_BACKEND_FILES } from '../data/backendArchitectureDocs';
import { DATABASE_SCHEMAS } from '../data/initialData';

interface BackendArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendArchitectureModal: React.FC<BackendArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'database' | 'python_code' | 'api_endpoints'>('database');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [selectedTable, setSelectedTable] = useState(DATABASE_SCHEMAS[0].tableName);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = PYTHON_BACKEND_FILES[selectedFileIdx];
  const currentTableSchema = DATABASE_SCHEMAS.find((t) => t.tableName === selectedTable);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl">
      <div
        id="backend-architecture-modal"
        className="relative w-full max-w-6xl h-[90vh] bg-[#0d0f15] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141e] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#c9a875]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif-display font-semibold text-white flex items-center gap-2">
                Python Backend Architecture & DBMS Inspector
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono-code">
                FastAPI • SQLAlchemy 2.0 • PostgreSQL / JSONB • S3 Storage Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher tabs */}
            <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono-code">
              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'database' ? 'bg-[#c9a875] text-[#0d0e12] font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Database Schema & ERD
              </button>
              <button
                onClick={() => setActiveTab('python_code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'python_code' ? 'bg-[#c9a875] text-[#0d0e12] font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Python ORM & Storage
              </button>
            </div>

            <button
              id="close-backend-modal"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {activeTab === 'database' ? (
            /* Database Schema Browser */
            <>
              {/* Left Column: Tables list */}
              <div className="md:col-span-4 border-r border-white/10 bg-[#10121a] p-4 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between px-2 mb-3">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-[#c9a875]">
                    Relational Tables (6)
                  </span>
                  <span className="text-[10px] text-white/40 font-mono-code">PostgreSQL 16</span>
                </div>

                {DATABASE_SCHEMAS.map((tbl) => (
                  <button
                    key={tbl.tableName}
                    onClick={() => setSelectedTable(tbl.tableName)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedTable === tbl.tableName
                        ? 'bg-[#c9a875]/15 border-[#c9a875] text-white'
                        : 'bg-black/20 border-white/5 text-white/70 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-code text-xs font-semibold text-white">
                        {tbl.tableName}
                      </span>
                      <span className="text-[10px] font-mono-code text-[#c9a875]">
                        {tbl.columns.length} cols
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 line-clamp-1">{tbl.description}</p>
                  </button>
                ))}

                {/* Relational Graph Summary */}
                <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#c9a875] font-mono-code font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ACID & Integrity Guarantees
                  </div>
                  <ul className="text-[11px] text-white/70 space-y-1.5 list-disc pl-4">
                    <li>1-to-Many cascade delete on Artist to Artworks & Comments.</li>
                    <li>1-to-1 dedicated extension table for PoetryCards & VideoMedia.</li>
                    <li>Indexed composite unique constraints on user interactions.</li>
                    <li>JSONB indexing for color palettes and tags.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Selected Table Columns & Data Definition */}
              <div className="md:col-span-8 p-6 overflow-y-auto bg-[#0d0e14] space-y-6">
                {currentTableSchema && (
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-xl font-mono-code font-bold text-white flex items-center gap-2">
                          Table: <span className="text-[#c9a875]">{currentTableSchema.tableName}</span>
                        </h3>
                        <p className="text-xs text-white/60 mt-1">{currentTableSchema.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono-code bg-white/10 text-white/80 border border-white/15">
                        Schema: public
                      </span>
                    </div>

                    {/* Columns Table */}
                    <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden shadow-lg bg-[#11131c]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#171a26] text-white/60 font-mono-code uppercase text-[10px] tracking-wider border-b border-white/10">
                          <tr>
                            <th className="px-4 py-3">Column</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Key / Nullable</th>
                            <th className="px-4 py-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono-code">
                          {currentTableSchema.columns.map((col, cIdx) => (
                            <tr key={cIdx} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-semibold text-white flex items-center gap-1.5">
                                {col.name}
                                {col.isPrimary && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">
                                    PK
                                  </span>
                                )}
                                {col.isForeign && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px]" title={`References ${col.foreignTable}`}>
                                    FK
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-[#c9a875]">{col.type}</td>
                              <td className="px-4 py-3 text-white/50 text-[11px]">
                                {col.nullable ? 'NULL' : 'NOT NULL'}
                              </td>
                              <td className="px-4 py-3 text-white/70 font-sans text-xs">
                                {col.description}
                                {col.foreignTable && (
                                  <span className="block text-[10px] text-blue-400 font-mono-code">
                                    → {col.foreignTable}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Python Code & Storage Engine Browser */
            <>
              {/* Left Column: Files list */}
              <div className="md:col-span-4 border-r border-white/10 bg-[#10121a] p-4 overflow-y-auto space-y-2">
                <span className="text-xs font-mono-code uppercase tracking-wider text-[#c9a875] block px-2 mb-3">
                  Python Backend Modules (3)
                </span>

                {PYTHON_BACKEND_FILES.map((file, fIdx) => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFileIdx(fIdx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedFileIdx === fIdx
                        ? 'bg-[#c9a875]/15 border-[#c9a875] text-white'
                        : 'bg-black/20 border-white/5 text-white/70 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono-code text-xs font-semibold text-white">
                      <Code2 className="w-3.5 h-3.5 text-[#c9a875]" />
                      {file.filename}
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 line-clamp-1">{file.description}</p>
                  </button>
                ))}
              </div>

              {/* Right Column: Code Viewer */}
              <div className="md:col-span-8 p-6 overflow-y-auto bg-[#0a0b0f] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="text-sm font-mono-code font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#c9a875]" />
                      {currentFile.filename}
                    </h3>
                    <p className="text-xs text-white/50">{currentFile.description}</p>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono-code text-white transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy Python Code'}</span>
                  </button>
                </div>

                <pre className="flex-1 p-4 rounded-2xl bg-black/60 border border-white/10 font-mono-code text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{currentFile.content}</code>
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

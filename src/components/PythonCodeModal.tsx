import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Download, FileCode2, ExternalLink } from 'lucide-react';

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pythonCode: string;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({
  isOpen,
  onClose,
  pythonCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Safe119 단일 파이썬 파일 (`app.py`) 소스코드</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Streamlit + Plotly
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                복사하거나 다운로드하여 `streamlit run app.py` 명령어로 즉시 실행할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사 완료!' : '코드 복사'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              app.py 다운로드
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Execution Guide Bar */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Terminal className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">1. 설치:</span>
            <code className="bg-slate-900 px-2 py-0.5 rounded text-orange-300 border border-slate-800">
              pip install streamlit pandas plotly requests python-dotenv
            </code>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <span className="text-slate-400">2. 실행:</span>
            <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300 border border-slate-800">
              streamlit run app.py
            </code>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">{pythonCode}</pre>
        </div>
      </div>
    </div>
  );
};

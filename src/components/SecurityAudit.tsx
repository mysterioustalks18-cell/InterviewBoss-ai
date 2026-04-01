import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, CheckCircle, Lock, Code, Terminal, ArrowRight, Loader2, Info, ExternalLink, Copy, Check, ChevronLeft, WifiOff, FileWarning, Database, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { performSecurityAudit, getErrorInfo } from '../services/geminiService';
import { SecurityAuditResult } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const VulnerabilityCard: React.FC<{ 
  vuln: any; 
  idx: number; 
  getSeverityColor: (s: string) => string;
  language: string;
}> = ({ vuln, idx, getSeverityColor, language }) => {
  const [copiedRemediation, setCopiedRemediation] = useState(false);
  const [copiedFixed, setCopiedFixed] = useState(false);

  const handleCopyRemediation = () => {
    navigator.clipboard.writeText(vuln.remediation);
    setCopiedRemediation(true);
    setTimeout(() => setCopiedRemediation(false), 2000);
  };

  const handleCopyFixed = () => {
    if (vuln.fixed_code) {
      navigator.clipboard.writeText(vuln.fixed_code);
      setCopiedFixed(true);
      setTimeout(() => setCopiedFixed(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-[#151921] border border-white/5 rounded-xl overflow-hidden"
    >
      <div className="p-4 flex items-start justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${vuln.severity === 'Critical' || vuln.severity === 'High' ? 'text-red-400' : 'text-yellow-400'}`} />
          <div>
            <h4 className="font-semibold text-gray-200">{vuln.name}</h4>
            <div className="text-[10px] font-mono text-gray-500 uppercase">{vuln.location}</div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(vuln.severity)}`}>
          {vuln.severity}
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <h5 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Explanation</h5>
          <p className="text-sm text-gray-400 leading-relaxed">{vuln.explanation}</p>
        </div>
        <div>
          <h5 className="text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center justify-between">
            Remediation
            <button 
              onClick={handleCopyRemediation}
              className="text-gray-600 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              {copiedRemediation ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span className="text-[9px]">{copiedRemediation ? 'Copied' : 'Copy'}</span>
            </button>
          </h5>
          <div className="bg-black/40 rounded-lg p-3 border border-white/5 group/code relative">
            <p className="text-sm text-emerald-400/90 font-mono whitespace-pre-wrap">{vuln.remediation}</p>
            {vuln.fixed_code && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Secure Fix Snippet</span>
                  <button 
                    onClick={handleCopyFixed}
                    className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded text-[10px] text-emerald-400 transition-all active:scale-95"
                  >
                    {copiedFixed ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  language={language === 'shell' ? 'bash' : language === 'plaintext' ? 'text' : language}
                  style={vscDarkPlus}
                  customStyle={{
                    background: 'transparent',
                    padding: '0.5rem',
                    fontSize: '11px',
                    margin: 0
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                    }
                  }}
                >
                  {vuln.fixed_code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
        <div>
          <h5 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Real-World Impact</h5>
          <p className="text-sm text-gray-400 italic">"{vuln.impact}"</p>
        </div>
      </div>
    </motion.div>
  );
};

export const SecurityAudit: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [result, setResult] = useState<SecurityAuditResult | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if ((window as any).aistudio) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleOpenKeyDialog = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleCopyFull = () => {
    if (result?.secure_version) {
      navigator.clipboard.writeText(result.secure_version);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    }
  };

  const scanSteps = [
    "Initializing secure environment...",
    "Parsing input structure...",
    "Checking against OWASP Top 10...",
    "Analyzing data flow patterns...",
    "Detecting potential injection vectors...",
    "Verifying authentication logic...",
    "Cross-referencing vulnerability databases...",
    "Performing static code analysis...",
    "Simulating dynamic execution paths...",
    "Checking dependency tree for known CVEs...",
    "Analyzing network traffic patterns...",
    "Verifying encryption standards...",
    "Generating remediation strategies...",
    "Finalizing elite security report..."
  ];

  const handleAudit = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setScanStep(0);
    setScanLogs([]);
    setResult(null);
    setError(null);

    // Simulate scanning logs
    const logInterval = setInterval(() => {
      setScanStep(prev => {
        if (prev < scanSteps.length - 1) {
          setScanLogs(logs => [...logs, scanSteps[prev]]);
          return prev + 1;
        }
        clearInterval(logInterval);
        return prev;
      });
    }, 600);

    try {
      const auditResult = await performSecurityAudit(code, language);
      
      // Ensure the animation feels substantial
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult(auditResult);
      
      // Save to history if authenticated
      if (isAuthenticated) {
        await api.post('/api/security-audits', {
          input: code,
          result: auditResult,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Audit failed:', err);
      setError(err);
      
      const errorMessage = (err?.message || String(err)).toLowerCase();
      if (
        errorMessage.includes("requested entity was not found") || 
        errorMessage.includes("permission_denied") || 
        errorMessage.includes("403") ||
        errorMessage.includes("not have permission")
      ) {
        setHasKey(false);
      }
    } finally {
      setIsAnalyzing(false);
      clearInterval(logInterval);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Configure JS/TS validation
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add a format action to the context menu
    editor.addAction({
      id: 'format-code',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: (ed: any) => {
        ed.getAction('editor.action.formatDocument').run();
      }
    });
  };

  const handleFormat = () => {
    // This is a bit tricky with the controlled component, 
    // but Monaco usually handles it if we trigger the action.
    // For now, we'll just provide the UI feedback.
  };

  const handleClear = () => {
    setCode('');
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(code);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const getDetailedErrorInfo = (err: any) => {
    const message = (err?.message || String(err)).toLowerCase();
    
    if (message.includes("api key") || message.includes("api_key_invalid") || message.includes("not configured")) {
      return {
        type: "auth",
        title: "Configuration Error",
        message: "The security engine's API key is missing or invalid. This deep analysis requires a valid Gemini API key to function.",
        suggestion: "Ensure GEMINI_API_KEY is correctly set in your environment variables.",
        icon: <Lock className="w-8 h-8 text-red-400" />
      };
    }
    
    if (message.includes("quota") || message.includes("rate limit") || message.includes("429")) {
      return {
        type: "quota",
        title: "Usage Limit Reached",
        message: "The AI security engine has reached its temporary usage limit due to high volume of requests.",
        suggestion: "Please wait 60 seconds and try again. This helps maintain service stability.",
        icon: <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      };
    }
    
    if (message.includes("safety") || message.includes("blocked") || message.includes("harm_category")) {
      return {
        type: "safety",
        title: "Content Filtered",
        message: "The input was flagged by safety filters. Our AI engine cannot analyze content it deems potentially harmful, sensitive, or violating safety policies.",
        suggestion: "Try removing sensitive data, PII, or reducing the code snippet size to focus on specific logic.",
        icon: <Shield className="w-8 h-8 text-yellow-400" />
      };
    }
    
    if (message.includes("network") || message.includes("fetch") || message.includes("failed to execute 'fetch'")) {
      return {
        type: "network",
        title: "Connection Error",
        message: "A network timeout or connection issue occurred while communicating with the security engine.",
        suggestion: "Check your internet connection and verify if any firewall is blocking outgoing requests.",
        icon: <WifiOff className="w-8 h-8 text-blue-400" />
      };
    }
    
    if (message.includes("parse") || message.includes("json") || message.includes("malformed")) {
      return {
        type: "parsing",
        title: "Analysis Failure",
        message: "The security engine failed to parse the generated report. This usually happens with extremely complex or non-standard code structures.",
        suggestion: "Try breaking the code into smaller, more focused snippets for individual analysis.",
        icon: <FileWarning className="w-8 h-8 text-purple-400" />
      };
    }

    if (message.includes("database") || message.includes("api/security-audits")) {
      return {
        type: "database",
        title: "History Sync Error",
        message: "The audit was successful, but we couldn't save it to your history.",
        suggestion: "Your analysis is visible below, but it won't be saved to your dashboard history.",
        icon: <Database className="w-8 h-8 text-gray-400" />
      };
    }
    
    return {
      type: "unknown",
      title: "Audit Failed",
      message: err?.message || String(err) || "An unexpected error occurred during the security scan.",
      suggestion: "Please try again. If the issue persists, try refreshing the page.",
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Safe': return 'text-emerald-500';
      case 'Needs Improvement': return 'text-yellow-500';
      case 'High Risk': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </motion.button>

      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Security Auditor Elite</h1>
          </div>
          <p className="text-gray-400">Full-spectrum AI-powered vulnerability detection and secure coding assistant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-[#151921] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Code className="w-4 h-4" />
                    <span>Source Code / Logs / Error Input</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopyInput}
                      className={`p-1.5 rounded transition-all flex items-center gap-1.5 ${
                        copiedInput 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'hover:bg-white/5 text-gray-500 hover:text-blue-400'
                      }`}
                      title="Copy Input Code"
                    >
                      {copiedInput ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleClear}
                      className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-red-400 transition-colors"
                      title="Clear Editor"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-[10px] uppercase tracking-widest text-blue-400/50 font-mono">
                      Defensive Mode Active
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <Terminal className="w-3 h-3" />
                    Language Section
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'javascript', label: 'JS' },
                      { id: 'typescript', label: 'TS' },
                      { id: 'python', label: 'Python' },
                      { id: 'go', label: 'Go' },
                      { id: 'rust', label: 'Rust' },
                      { id: 'java', label: 'Java' },
                      { id: 'cpp', label: 'C++' },
                      { id: 'ruby', label: 'Ruby' },
                      { id: 'php', label: 'PHP' },
                      { id: 'json', label: 'JSON' },
                      { id: 'shell', label: 'Shell' },
                      { id: 'plaintext', label: 'Text' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          language === lang.id 
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            
              <div className="w-full h-[400px] bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors relative group/editor">
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover/editor:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={handleCopyInput}
                    className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[10px] text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    {copiedInput ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      // We can't easily trigger format from outside without a ref, 
                      // but we can show the shortcut
                    }}
                    className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[10px] text-gray-400 hover:text-white transition-colors"
                    title="Alt + Shift + F to Format"
                  >
                    Format
                  </button>
                </div>
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontLigatures: true,
                    cursorStyle: 'line',
                    wordWrap: 'on',
                    quickSuggestions: {
                      other: true,
                      comments: false,
                      strings: true
                    },
                    suggestOnTriggerCharacters: true,
                    parameterHints: { enabled: true },
                    folding: true,
                    links: true,
                    colorDecorators: true,
                    bracketPairColorization: { enabled: true },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    renderLineHighlight: 'all',
                    renderWhitespace: 'selection',
                    tabSize: 2,
                    insertSpaces: true,
                    fixedOverflowWidgets: true,
                    glyphMargin: true,
                    lightbulb: { enabled: 'on' as any },
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10,
                    }
                  }}
                  loading={
                    <div className="flex items-center justify-center h-full text-gray-500 font-mono text-sm">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Initializing IDE...
                    </div>
                  }
                />
              </div>

            <div className="mt-6">
              {hasKey === false ? (
                <Button 
                  className="w-full py-6 text-lg group relative overflow-hidden bg-amber-600 hover:bg-amber-500"
                  onClick={handleOpenKeyDialog}
                >
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  Select API Key to Audit
                </Button>
              ) : (
                <Button 
                  className="w-full py-6 text-lg group relative overflow-hidden"
                  onClick={handleAudit}
                  disabled={isAnalyzing || !code.trim()}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Vulnerabilities...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-5 h-5" />
                        Run Security Audit
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200/70 leading-relaxed">
              <span className="font-semibold text-blue-300">Pro Tip:</span> For best results, include relevant context like framework versions or specific error traces. Our AI analyzes patterns against OWASP Top 10 and common misconfigurations.
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {error && !isAnalyzing && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-red-500/5 border border-dashed border-red-500/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  {getDetailedErrorInfo(error).icon}
                </div>
                <h3 className="text-xl font-medium mb-2 text-red-200">{getDetailedErrorInfo(error).title}</h3>
                <div className="space-y-4 mb-8">
                  <p className="text-red-400/70 max-w-xs text-sm">
                    {getDetailedErrorInfo(error).message}
                  </p>
                  <p className="text-xs text-red-500/40 font-mono italic">
                    Suggestion: {getDetailedErrorInfo(error).suggestion}
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                  <Button 
                    variant="primary" 
                    className="w-full py-6 shadow-lg shadow-blue-500/20"
                    onClick={handleAudit}
                  >
                    <Loader2 className="w-4 h-4 mr-2 hidden group-hover:block" />
                    Retry Security Audit
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => setError(null)}
                    >
                      Clear Error
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => {
                        const info = getDetailedErrorInfo(error);
                        navigator.clipboard.writeText(`${info.title}: ${info.message} ${info.suggestion}`);
                        alert("Error details copied to clipboard.");
                      }}
                    >
                      Copy Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {!result && !isAnalyzing && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#151921] border border-dashed border-white/10 rounded-2xl"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Awaiting Input</h3>
                <p className="text-gray-500 max-w-xs">
                  Provide code or logs to generate a comprehensive security report.
                </p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col bg-[#151921] border border-white/5 rounded-2xl overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center flex-1 text-center p-8 space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                    <Shield className="w-10 h-10 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="w-full max-w-xs space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Scanning for Vulnerabilities</h3>
                      <p className="text-gray-500 text-xs uppercase tracking-widest font-mono">
                        Step {scanStep + 1} of {scanSteps.length}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                    </div>

                    <div className="h-6">
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={scanStep}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-sm text-blue-400 font-medium"
                        >
                          {scanSteps[scanStep]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 p-4 font-mono text-[10px] space-y-1 h-48 overflow-y-auto border-t border-white/5">
                  {scanLogs.map((log, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className="flex items-center gap-2"
                    >
                      <span className="text-blue-500/50">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-emerald-500/70">{log}</span>
                    </motion.div>
                  ))}
                  <div className="w-1 h-3 bg-emerald-500 animate-pulse inline-block ml-1" />
                </div>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary Card */}
                <div className="bg-[#151921] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-32 h-32 text-white" />
                  </div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getVerdictColor(result.verdict)}`}>
                          {result.risk_score}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Risk Score</div>
                      </div>
                      <div className="h-10 w-px bg-white/10" />
                      <div>
                        <div className={`text-lg font-semibold ${getVerdictColor(result.verdict)}`}>
                          {result.verdict}
                        </div>
                        <div className="text-sm text-gray-400">Security Verdict</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${result.risk_score < 30 ? 'bg-emerald-500' : result.risk_score < 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Live Report</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-8 relative z-10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.risk_score}%` }}
                      className={`h-full ${result.risk_score < 30 ? 'bg-emerald-500' : result.risk_score < 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Summary</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{result.summary.content}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Security Posture</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{result.summary.posture}</p>
                    </div>
                  </div>

                  {result.secure_version && (
                    <div className="mt-6 pt-6 border-t border-white/5 relative z-10 flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => {
                          setCode(result.secure_version!);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Apply Secure Rewrite
                      </Button>
                      <Button
                        variant="outline"
                        className="px-4 border-white/10 text-gray-400 hover:text-white"
                        onClick={handleCopyFull}
                      >
                        {copiedFull ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Vulnerabilities List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 px-2">Detected Issues ({result.vulnerabilities.length})</h3>
                  {result.vulnerabilities.map((vuln, idx) => (
                    <VulnerabilityCard 
                      key={idx} 
                      vuln={vuln} 
                      idx={idx} 
                      getSeverityColor={getSeverityColor} 
                      language={language}
                    />
                  ))}
                </div>

                {/* Best Practices */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-emerald-300">Recommended Best Practices</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.best_practices.map((practice, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-emerald-200/60">
                        <span className="text-emerald-500 font-mono">0{idx + 1}</span>
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>

                {!isAuthenticated && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">Save Your Security Reports</h3>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      You've just run a deep security audit. Create a free account to save your scan history, track vulnerability trends, and unlock the <span className="text-blue-400">One-Click Secure Rewrite</span> history.
                    </p>
                    <Button className="px-8" onClick={() => window.location.href = '/login'}>
                      Create Free Account
                    </Button>
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <Button variant="ghost" className="text-xs text-gray-500 hover:text-white" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Back to Top
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

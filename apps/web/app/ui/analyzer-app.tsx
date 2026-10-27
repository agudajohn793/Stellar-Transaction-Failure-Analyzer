"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Code2,
  Download,
  FileCode2,
  FileSearch,
  Github,
  Layers3,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X
} from "lucide-react";
import { errorCatalog } from "@stellar-failure/error-catalog";
import type { TransactionDiagnosis } from "@stellar-failure/diagnosis-engine";
import { inspectSimulationResponse, type SimulationSummary } from "@stellar-failure/decoder";

type View = "analyze" | "simulation" | "library" | "docs";
type InputMode = "hash" | "xdr";

const navigation: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "analyze", label: "Transaction analyzer", icon: FileSearch },
  { id: "simulation", label: "Simulation inspector", icon: Activity },
  { id: "library", label: "Error library", icon: BookOpen },
  { id: "docs", label: "Documentation", icon: Code2 }
];

export default function AnalyzerApp() {
  const [view, setView] = useState<View>("analyze");
  const [inputMode, setInputMode] = useState<InputMode>("hash");
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [input, setInput] = useState("");
  const [report, setReport] = useState<TransactionDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [simulationInput, setSimulationInput] = useState("");
  const [simulationError, setSimulationError] = useState("");
  const [simulationSummary, setSimulationSummary] = useState<SimulationSummary | null>(null);
  const [simulationDetail, setSimulationDetail] = useState("");

  const filteredErrors = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    if (!query) return errorCatalog;
    return errorCatalog.filter((item) =>
      `${item.code} ${item.title} ${item.explanation}`.toLowerCase().includes(query)
    );
  }, [libraryQuery]);

  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReport(null);
    setLoading(true);
    try {
      const payload = inputMode === "hash"
        ? { type: "hash", transactionHash: input.trim(), network }
        : { type: "xdr", resultXdr: input.trim() };
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json() as TransactionDiagnosis | { error: string };
      if (!response.ok || "error" in result) {
        throw new Error("error" in result ? result.error : "Analysis request failed.");
      }
      setReport(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not access the clipboard. Use the download option instead.");
    }
  }

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stellar-diagnosis-${report.transactionHash ?? "xdr"}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function inspectSimulation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSimulationError("");
    setSimulationSummary(null);
    setSimulationDetail("");
    try {
      const value: unknown = JSON.parse(simulationInput);
      setSimulationSummary(inspectSimulationResponse(value));
      setSimulationDetail(JSON.stringify(value, null, 2));
    } catch (reason) {
      setSimulationError(reason instanceof Error ? reason.message : "Invalid JSON.");
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); setView("analyze"); }}>
          <span className="brand-mark"><Activity size={20} strokeWidth={2.2} /></span>
          <span className="brand-name">stellar<span>trace</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => setView(id)} aria-label={label} aria-current={view === id ? "page" : undefined}>
              <Icon size={17} /> <span>{label}</span>
              {id === "analyze" && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="network-health"><span className="pulse-dot" /> Public network endpoints</div>
          <a className="sidebar-link" href="https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer" target="_blank" rel="noreferrer">
            <Github size={16} /> View on GitHub <ArrowUpRight size={13} />
          </a>
          <div className="version">STELLAR TRACE <span>v1.0 MVP</span></div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{navigation.find((item) => item.id === view)?.label}</strong></div>
          <div className="topbar-right">
            <span className="network-badge"><span className="pulse-dot" /> {network === "testnet" ? "TESTNET" : "MAINNET"}</span>
            <a className="docs-link" href="https://developers.stellar.org/" target="_blank" rel="noreferrer">Stellar docs <ArrowUpRight size={13} /></a>
          </div>
        </header>

        <div className="content">
          {view === "analyze" && (
            <section className="analyzer-view">
              <div className="eyebrow"><span className="eyebrow-icon"><Sparkles size={13} /></span> STELLAR DEBUGGING TOOL</div>
              <div className="page-heading-row">
                <div>
                  <h1>Understand what went wrong.</h1>
                  <p className="lead">Decode transaction results into clear, source-backed diagnostics.</p>
                </div>
                <div className="trust-chip"><ShieldCheck size={15} /> No guessing. Just decoded results.</div>
              </div>

              <div className="analyzer-card">
                <div className="card-header">
                  <div className="card-title"><span className="step-number">01</span><div><h2>Analyze a transaction</h2><p>Look up a hash or decode a result directly.</p></div></div>
                  <div className="input-toggle" role="group" aria-label="Input type">
                    <button className={inputMode === "hash" ? "selected" : ""} onClick={() => { setInputMode("hash"); setError(""); }} aria-pressed={inputMode === "hash"}><Search size={14} /> Hash lookup</button>
                    <button className={inputMode === "xdr" ? "selected" : ""} onClick={() => { setInputMode("xdr"); setError(""); }} aria-pressed={inputMode === "xdr"}><FileCode2 size={14} /> Paste XDR</button>
                  </div>
                </div>

                <form onSubmit={analyze}>
                  {inputMode === "hash" ? (
                    <>
                      <label className="field-label" htmlFor="transaction-input">TRANSACTION HASH</label>
                      <div className="input-row">
                        <div className="hash-input-wrap"><span className="hash-prefix">TX</span><input id="transaction-input" autoComplete="off" spellCheck={false} placeholder="Paste a 64-character transaction hash" value={input} onChange={(event) => setInput(event.target.value)} maxLength={128} required /></div>
                        <label className="select-wrap" htmlFor="network-select"><select id="network-select" value={network} onChange={(event) => setNetwork(event.target.value as "testnet" | "mainnet")}><option value="testnet">Testnet</option><option value="mainnet">Mainnet</option></select><ChevronDown size={14} /></label>
                      </div>
                      <div className="field-hint"><CircleHelp size={13} /> RPC lookup with Horizon fallback for older transactions.</div>
                    </>
                  ) : (
                    <>
                      <label className="field-label" htmlFor="xdr-input">BASE64 TRANSACTIONRESULT XDR</label>
                      <textarea id="xdr-input" className="xdr-input" placeholder="Paste the result_xdr value returned by Stellar RPC or Horizon" value={input} onChange={(event) => setInput(event.target.value)} maxLength={200_000} required spellCheck={false} />
                      <div className="field-hint"><CircleHelp size={13} /> Accepts a base64-encoded TransactionResult XDR (200 KB max).</div>
                    </>
                  )}
                  <div className="form-footer">
                    <span className="privacy-note"><ShieldCheck size={14} /> Not persisted; hash lookups use public network providers.</span>
                    <button className="primary-button" type="submit" disabled={loading || !input.trim()}>
                      {loading ? <><LoaderCircle className="spin" size={16} /> Analyzing</> : <>Analyze transaction <ArrowUpRight size={15} /></>}
                    </button>
                  </div>
                </form>
              </div>

              {error && <div className="error-banner" role="alert"><TriangleAlert size={17} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={15} /></button></div>}

              {report ? <ResultPanel report={report} onCopy={copyReport} onDownload={downloadReport} copied={copied} /> : !loading && (
                <div className="empty-state">
                  <div className="empty-icon"><FileSearch size={22} /></div>
                  <div><h3>Your diagnosis will appear here</h3><p>Submit a transaction to see the decoded result, known explanations, and operation-level details.</p></div>
                  <div className="empty-meta"><span>01</span> Decode <i /> <span>02</span> Match <i /> <span>03</span> Explain</div>
                </div>
              )}
              <div className="bottom-note"><ShieldCheck size={14} /><span>Every diagnosis is tied to a decoded Stellar result code and a cited protocol mapping.</span><button onClick={() => setView("library")}>Browse error library <ArrowUpRight size={13} /></button></div>
            </section>
          )}

          {view === "library" && (
            <section>
              <PageIntro eyebrow="REFERENCE" title="Known error library" description="Search documented Stellar transaction and operation result codes. Unlisted codes remain unmapped in diagnoses." />
              <div className="library-search"><Search size={17} /><input placeholder="Search by code or description..." value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} aria-label="Search known errors" /><span>{filteredErrors.length} MAPPINGS</span></div>
              <div className="error-list grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredErrors.map((item) => (
                  <article className="error-card" key={item.code}>
                    <div className="error-code-row"><code>{item.code}</code><a href={item.sourceUrl} target="_blank" rel="noreferrer">Protocol source <ArrowUpRight size={13} /></a></div>
                    <h2>{item.title}</h2><p>{item.explanation}</p>
                    <div className="check-list">{item.checks.map((check) => <div key={check}><Check size={14} />{check}</div>)}</div>
                  </article>
                ))}
                {filteredErrors.length === 0 && <div className="library-empty">No documented mappings match “{libraryQuery}”.</div>}
              </div>
            </section>
          )}

          {view === "simulation" && (
            <section>
              <PageIntro eyebrow="CONTRACT TOOLING" title="Simulation inspector" description="Inspect the shape of a Soroban simulation response without treating simulation output as a transaction failure diagnosis." />
              <form className="simulation-card" onSubmit={inspectSimulation}>
                <label className="field-label" htmlFor="simulation-input">SIMULATION RESPONSE JSON</label>
                <textarea id="simulation-input" className="simulation-input" placeholder={'Paste a response from rpc.Server.simulateTransaction(...)\n\n{\n  "results": [],\n  "events": []\n}'} value={simulationInput} onChange={(event) => setSimulationInput(event.target.value)} spellCheck={false} maxLength={200_000} />
                <div className="form-footer"><span className="privacy-note"><ShieldCheck size={14} /> Parsed locally in your browser.</span><button className="primary-button" type="submit" disabled={!simulationInput.trim()}>Inspect response <ArrowUpRight size={15} /></button></div>
              </form>
              {simulationError && <div className="error-banner" role="alert"><TriangleAlert size={17} />{simulationError}</div>}
              {simulationSummary && <div className="simulation-summary"><h2><Check size={17} /> RPC response inspected</h2>
                {simulationSummary.error ? <p className="simulation-error">RPC reported: {simulationSummary.error}</p> : <p>No RPC error field was reported.</p>}
                {simulationSummary.latestLedger !== undefined && <p>Latest ledger: {simulationSummary.latestLedger}</p>}
                {simulationSummary.minimumResourceFee !== undefined && <p>Minimum resource fee: {simulationSummary.minimumResourceFee} stroops</p>}
                <p>Invocation result entries: {simulationSummary.resultCount} · Authorization entries: {simulationSummary.authorizationCount} · Diagnostic events: {simulationSummary.diagnosticEventCount}</p>
                {simulationSummary.restorePreambleFee !== undefined && <p className="simulation-restore">Restore preamble present. Restore expired ledger entries before submitting this invocation (minimum resource fee: {simulationSummary.restorePreambleFee} stroops).</p>}
                <pre>{simulationDetail}</pre><p className="muted-copy">Simulation is provisional and does not guarantee transaction inclusion. XDR fields are displayed as supplied and are not independently decoded here.</p></div>}
              <div className="info-callout"><CircleHelp size={17} /><p>Simulation results are provisional. A successful simulation does not guarantee transaction inclusion; inspect the submitted transaction result XDR for a definitive diagnosis.</p></div>
            </section>
          )}

          {view === "docs" && <Documentation />}
        </div>
      </div>
    </main>
  );
}

function ResultPanel({ report, onCopy, onDownload, copied }: {
  report: TransactionDiagnosis;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}) {
  const hasFailedOperation = report.operations.some((operation) => operation.failed);
  return (
    <section className="result-panel" aria-live="polite">
      <div className="result-heading">
        <div><div className="section-kicker"><span className="step-number">02</span> DIAGNOSIS</div><h2>Analysis results</h2></div>
        <div className="report-actions"><button onClick={onCopy}><Clipboard size={14} />{copied ? "Copied" : "Copy JSON"}</button><button onClick={onDownload}><Download size={14} />Export report</button></div>
      </div>
      <div className={`diagnosis-card ${report.status}`}>
        <div className="diagnosis-status"><span className="status-icon">{report.status === "failed" ? <TriangleAlert size={18} /> : <Check size={18} />}</span><span>{report.status === "failed" ? "TRANSACTION FAILED" : "TRANSACTION SUCCEEDED"}</span><span className="diagnosis-code">{report.resultCode}{report.innerResultCode ? ` · ${report.innerResultCode}` : ""}</span></div>
        <h3>{report.title}</h3>
        <p>{report.explanation}</p>
        {report.checks.length > 0 && <div className="suggested-checks"><strong>SUGGESTED CHECKS</strong>{report.checks.map((check) => <div key={check}><span>—</span>{check}</div>)}</div>}
        <div className="provenance">
          {report.known && report.sourceUrl ? <a href={report.sourceUrl} target="_blank" rel="noreferrer">View protocol source <ArrowUpRight size={13} /></a> : <span className="unmapped"><CircleHelp size={13} /> No documented mapping</span>}
          <span>Decoded from {report.source === "rpc" ? "Stellar RPC" : report.source === "horizon" ? "Horizon" : "pasted XDR"}</span>
        </div>
      </div>
      <div className="metadata-strip">
        <div><span>NETWORK</span><strong>{report.network ? report.network.toUpperCase() : "XDR INPUT"}</strong></div>
        <div><span>LEDGER</span><strong>{report.ledger ?? "—"}</strong></div>
        <div><span>FEE CHARGED</span><strong>{report.feeCharged} stroops</strong></div>
        <div><span>OPERATION RESULTS</span><strong>{report.operations.length || "—"}</strong></div>
      </div>
      <div className="operations-card">
        <div className="operations-heading"><div><Layers3 size={16} /><h3>Operation breakdown</h3></div><span>{report.operations.length} decoded</span></div>
        {report.operations.length ? report.operations.map((operation) => (
          <div className={`operation-row ${operation.failed ? "operation-failed" : ""}`} key={`${operation.index}-${operation.resultCode}`}>
            <span className="op-index">{String(operation.index).padStart(2, "0")}</span>
            <div className="op-main"><strong>{operation.operationType ?? "Transaction-level result"}</strong><span>{operation.title}</span></div>
            <code>{operation.resultCode}</code>
            <span className={`op-status ${operation.failed ? "failed" : "passed"}`}>{operation.failed ? "FAILED" : "OK"}</span>
          </div>
        )) : <div className="no-operations">{hasFailedOperation ? "Operation result details are unavailable." : "No operation result details are present for this transaction result."}</div>}
      </div>
      <div className="hash-reference"><span>TRANSACTION HASH</span><code>{report.transactionHash ?? "Not provided (XDR input)"}</code><button onClick={onCopy} aria-label="Copy full JSON report"><Clipboard size={14} /></button></div>
    </section>
  );
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-intro"><div className="eyebrow"><span className="eyebrow-icon"><BookOpen size={13} /></span> {eyebrow}</div><h1>{title}</h1><p className="lead">{description}</p></div>;
}

function Documentation() {
  return (
    <section>
      <PageIntro eyebrow="DEVELOPER GUIDE" title="Build with Stellar Trace" description="Use the same diagnosis engine in your own tools, or inspect how this dashboard decodes a transaction." />
      <div className="docs-grid">
        <article className="doc-card doc-wide"><div className="doc-icon"><Code2 size={18} /></div><h2>Install the SDK</h2><p>Use the Stellar JavaScript SDK to fetch a transaction result or decode a base64 TransactionResult XDR.</p><pre><code>{`import { xdr } from "@stellar/stellar-sdk";\n\nconst result = xdr.TransactionResult.fromXDR(\n  resultXdr,\n  "base64"\n);\nconst code = result.result().switch().name;`}</code></pre></article>
        <article className="doc-card"><div className="doc-icon"><FileSearch size={18} /></div><h2>Diagnosis package</h2><p>The reusable <code>diagnoseTransaction()</code> API decodes result XDR, applies only known catalog mappings, and returns a JSON report.</p><pre><code>{`import { diagnoseTransaction }\n  from "@stellar-failure/diagnosis-engine";\n\nconst report = diagnoseTransaction({\n  resultXdr,\n  transactionHash,\n  network: "testnet",\n  source: "rpc"\n});`}</code></pre></article>
        <article className="doc-card"><div className="doc-icon"><ShieldCheck size={18} /></div><h2>Evidence, not guesses</h2><p>Known explanations cite the Stellar XDR specification or operation docs. Unknown result codes stay visible and are never assigned a speculative cause.</p><a className="doc-external" href="https://github.com/stellar/stellar-xdr/blob/master/Stellar-transaction.x" target="_blank" rel="noreferrer">Stellar transaction XDR <ArrowUpRight size={14} /></a></article>
        <article className="doc-card doc-wide docs-note"><div className="doc-icon"><CircleHelp size={18} /></div><div><h2>Retention and historical transactions</h2><p>RPC lookup is attempted first, then Horizon. Standard RPC nodes may prune old transaction history, and Horizon retention is provider-dependent. If neither source has a transaction, submit its result XDR directly.</p></div></article>
      </div>
    </section>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AnalysisHistory {
  id: string;
  timestamp: string;
  productType: string;
  stage: string;
  transcriptPreview: string;
  result: string;
}

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productType, setProductType] = useState('SaaS');
  const [stage, setStage] = useState('Pre-revenue');
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [apiHealth, setApiHealth] = useState<{ status: string; openai_configured: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('pricelens_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      const response = await fetch(`${apiBaseUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiHealth(data);
      }
    } catch (e) {
      console.error('API health check failed:', e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedExtensions = ['.txt', '.md'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (allowedExtensions.includes(fileExt)) {
        setSelectedFile(file);
        setTranscript('');
        setError('');
      } else {
        setError(`File type not supported. Allowed: ${allowedExtensions.join(', ')}`);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim() && !selectedFile) {
      setError('Please provide a transcript or upload a file.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      let response;
      let analysisData;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('product_type', productType);
        formData.append('stage', stage);

        response = await fetch(`${apiBaseUrl}/analyze-file`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${apiBaseUrl}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            transcript,
            product_type: productType,
            stage: stage
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Analysis failed. Please ensure the backend is running.');
      }

      analysisData = await response.json();
      setResult(analysisData.result);

      // Save to history
      const historyItem: AnalysisHistory = {
        id: Date.now().toString(),
        timestamp: analysisData.timestamp || new Date().toISOString(),
        productType: analysisData.product_type || productType,
        stage: analysisData.stage || stage,
        transcriptPreview: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
        result: analysisData.result,
      };

      const newHistory = [historyItem, ...history].slice(0, 10); // Keep last 10
      setHistory(newHistory);
      localStorage.setItem('pricelens_history', JSON.stringify(newHistory));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: AnalysisHistory) => {
    setResult(item.result);
    setProductType(item.productType);
    setStage(item.stage);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pricelens_history');
  };

  const exportToMarkdown = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricelens-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      alert('Analysis copied to clipboard!');
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Background Glow */}
      <div className="hero-gradient" />

      {/* Navbar */}
      <nav className="container" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit' }}>
          Price<span className="gradient-text">Lens</span> AI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {apiHealth && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.85rem',
              color: apiHealth.openai_configured ? 'var(--accent)' : 'var(--muted)'
            }}>
              <span>{apiHealth.openai_configured ? '✅' : '⚠️'}</span>
              <span>{apiHealth.openai_configured ? 'Ready' : 'API Key Missing'}</span>
            </div>
          )}
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="glass nav-link"
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              📚 History ({history.length})
            </button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 100px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }} className="fade-in">
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '20px' }}>
            Turn Interviews into <span className="gradient-text">Pricing Power.</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Upload your transcripts and let our AI agents extract monetization signals, segments, and winning pricing strategies.
          </p>
        </header>

        {/* History Sidebar */}
        {showHistory && history.length > 0 && (
          <section className="glass fade-in" style={{ 
            padding: '30px', 
            borderRadius: '24px', 
            marginBottom: '30px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Analysis History</h3>
              <button
                onClick={clearHistory}
                className="nav-link"
                style={{ fontSize: '0.85rem', color: '#ef4444' }}
              >
                Clear All
              </button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="glass"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid var(--card-border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                      {item.productType} • {item.stage}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
                    {item.transcriptPreview}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ display: 'grid', gap: '40px' }}>
          {/* Input Section */}
          <section className="glass fade-in" style={{ padding: '40px', borderRadius: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Transcript Input</h2>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".txt"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', background: 'var(--card-border)', padding: '8px 16px', borderRadius: '24px' }}>
                  <span style={{ color: 'var(--accent)' }}>📄 {selectedFile.name}</span>
                  <button
                    onClick={clearFile}
                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="glass"
                  style={{ padding: '8px 20px', fontSize: '0.9rem', borderRadius: '12px', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload .txt File
                </button>
              )}
            </div>

            {/* Product Type and Stage Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Product Type
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
                >
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Business Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
                >
                  <option value="Pre-revenue">Pre-revenue</option>
                  <option value="Early-stage">Early-stage</option>
                  <option value="Growth">Growth</option>
                  <option value="Scale">Scale</option>
                  <option value="Mature">Mature</option>
                </select>
              </div>
            </div>

            <textarea
              className="input-field"
              placeholder={selectedFile ? "File selected! Secure connection established. Click 'Generate Report' to analyze." : "Paste your customer interview transcript here..."}
              style={{ height: '280px', marginBottom: '24px', opacity: selectedFile ? 0.4 : 1, fontSize: '1rem', lineHeight: '1.6' }}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              disabled={!!selectedFile}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
              {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>{error}</p>}
              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={isLoading}
                style={{ padding: '16px 32px', fontSize: '1.1rem' }}
              >
                {isLoading ? 'Synthesizing Strategy...' : 'Generate Expert Report'}
              </button>
            </div>
          </section>

          {/* Results Section */}
          {(isLoading || result) && (
            <section className="fade-in">
              <div className="glass" style={{ padding: '50px', borderRadius: '40px', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle background glow for results */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-10%',
                  width: '500px',
                  height: '500px',
                  background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                  zIndex: 0,
                  pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--card-border)', paddingBottom: '24px' }}>
                    <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '1.8rem' }}>📊</span> Expert Analysis Report
                    </h2>

                    {!isLoading && result && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={exportToMarkdown}
                          className="glass"
                          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span>📥</span> Export MD
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="glass"
                          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span>📋</span> Copy
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="glass"
                          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span>🖨️</span> Print
                        </button>
                      </div>
                    )}
                  </div>

                  {isLoading ? (
                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div className="skeleton" style={{ height: '40px', width: '30%' }}></div>
                      <div className="skeleton" style={{ height: '24px', width: '100%' }}></div>
                      <div className="skeleton" style={{ height: '24px', width: '90%' }}></div>
                      <div className="skeleton" style={{ height: '24px', width: '95%' }}></div>
                      <div className="skeleton" style={{ height: '200px', width: '100%', marginTop: '30px' }}></div>
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {result}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <footer style={{ marginTop: '100px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Powered by CrewAI Enterprise &amp; GPT-4o-mini &bull; Built for founders who move fast.
        </footer>
      </main>
    </div>
  );
}

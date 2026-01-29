'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.txt')) {
        setSelectedFile(file);
        setTranscript('');
        setError('');
      } else {
        setError('Only .txt files are supported for now.');
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
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

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
          body: JSON.stringify({ transcript }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed. Please ensure the backend is running.');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Background Glow */}
      <div className="hero-gradient" />

      {/* Navbar */}
      <nav className="container" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit' }}>
          Price<span className="gradient-text">Lens</span> AI
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

            <textarea
              className="input-field"
              placeholder={selectedFile ? "File selected! Secure connection established. Click &apos;Generate Report&apos; to analyze." : "Paste your customer interview transcript here..."}
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
                      <button
                        onClick={() => window.print()}
                        className="glass"
                        style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span>📥</span> Export PDF
                      </button>
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

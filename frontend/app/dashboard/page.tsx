'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export default function Dashboard() {
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
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            {/* Navbar for Dashboard */}
            <nav className="container" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit' }}>
                    Price<span className="gradient-text">Lens</span> AI
                </Link>
                <Link href="/" className="nav-link">← Back to Home</Link>
            </nav>

            <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gap: '30px' }}>
                    {/* Input Section */}
                    <section className="glass fade-in" style={{ padding: '30px', borderRadius: 'var(--radius)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Customer Interview Transcript</h2>

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".txt"
                                onChange={handleFileChange}
                            />

                            {selectedFile ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', background: 'var(--card-border)', padding: '5px 12px', borderRadius: '20px' }}>
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
                                    className="btn-primary"
                                    style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'var(--card-border)', boxShadow: 'none' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Upload .txt File
                                </button>
                            )}
                        </div>

                        <textarea
                            className="input-field"
                            placeholder={selectedFile ? "File selected! Click 'Generate Pricing Strategy' to analyze." : "Paste your interview transcript here..."}
                            style={{ height: '250px', marginBottom: '20px', opacity: selectedFile ? 0.3 : 1 }}
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            disabled={!!selectedFile}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>}
                            <button
                                className="btn-primary"
                                onClick={handleAnalyze}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Analyzing Signals...' : 'Generate Pricing Strategy'}
                            </button>
                        </div>
                    </section>

                    {/* Results Section */}
                    {(isLoading || result) && (
                        <section className="fade-in" style={{ marginTop: '20px' }}>
                            <div className="glass" style={{ padding: '40px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
                                {/* Subtle background glow for results */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    right: '-20%',
                                    width: '400px',
                                    height: '400px',
                                    background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                                    zIndex: 0,
                                    pointerEvents: 'none'
                                }} />

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--card-border)', paddingBottom: '20px' }}>
                                        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📋</span> Analysis Report
                                            {isLoading && <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'normal' }}>(AI Agents Synthesizing...)</span>}
                                        </h2>

                                        {!isLoading && result && (
                                            <button
                                                onClick={() => window.print()}
                                                className="glass nav-link"
                                                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <span>📥</span> Save as PDF
                                            </button>
                                        )}
                                    </div>

                                    {isLoading ? (
                                        <div style={{ display: 'grid', gap: '20px' }}>
                                            <div className="skeleton" style={{ height: '30px', width: '40%' }}></div>
                                            <div className="skeleton" style={{ height: '20px', width: '90%' }}></div>
                                            <div className="skeleton" style={{ height: '20px', width: '95%' }}></div>
                                            <div className="skeleton" style={{ height: '20px', width: '85%' }}></div>
                                            <div className="skeleton" style={{ height: '150px', width: '100%', marginTop: '20px' }}></div>
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

                <footer style={{ marginTop: '80px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    Powered by CrewAI & GPT-4o-mini • Built for early-stage founders
                </footer>
            </main>
        </div>
    );
}

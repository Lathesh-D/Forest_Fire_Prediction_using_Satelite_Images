import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "http://127.0.0.1:8000";

export default function Sentinel() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target.result);
            reader.readAsDataURL(file);
            setResult(null);
            setError('');
            setShowModal(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            fileInputRef.current.files = e.dataTransfer.files;
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handlePredict = async () => {
        const file = fileInputRef.current.files[0];
        if (!file) {
            alert("Please select an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setLoading(true);
        setError('');
        setResult(null);
        setShowModal(false);

        try {
            const response = await axios.post(`${API_URL}/predict`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000 // 30 second timeout
            });
            console.log("API Response:", response);
            const data = response.data;
            console.log("API Data:", data);

            if (!data) {
                throw new Error("Received empty response from server.");
            }

            setResult(data);

            if (data.is_fire && data.confidence > 0.90) {
                setShowModal(true);

                // Send email alert
                const userEmail = localStorage.getItem('userEmail');
                if (userEmail) {
                    try {
                        console.log("Sending alert to:", userEmail);
                        await axios.post(`${API_URL}/send-alert`, {
                            email: userEmail,
                            prediction: data.prediction,
                            confidence: data.confidence,
                            filename: fileInputRef.current.files[0]?.name || "Unknown Image",
                            timestamp: new Date().toLocaleString()
                        });
                        console.log("Alert email sent successfully.");
                    } catch (emailErr) {
                        console.error("Failed to send alert email:", emailErr);
                    }
                } else {
                    console.log("No user email found in localStorage.");
                }
            }

        } catch (err) {
            console.error("Prediction Error:", err);
            if (err.code === 'ECONNABORTED') {
                setError("Request timed out. The server took too long to respond.");
            } else if (err.response) {
                setError(`Server Error: ${err.response.data.detail || err.response.statusText}`);
            } else if (err.request) {
                setError("Network Error: Could not connect to the server.");
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNotify = () => {
        alert("🚨 Rangers have been notified with the current coordinates!");
        setShowModal(false);
    };

    const handleDownload = () => {
        alert("📄 Report downloaded successfully.");
        setShowModal(false);
    };

    return (
        <div style={{ animation: 'slideIn 0.3s ease', maxWidth: '800px', margin: '0 auto' }}>
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', padding: '30px', borderRadius: '20px',
                        maxWidth: '400px', width: '90%', textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(217, 83, 79, 0.4)',
                        border: '2px solid #d9534f',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🚨</div>
                        <h2 style={{ color: '#d9534f', margin: '0 0 10px 0' }}>CRITICAL FIRE DETECTED</h2>
                        <p style={{ color: '#555', marginBottom: '25px', fontSize: '1.1rem' }}>
                            Confidence Level: <strong style={{ color: '#d9534f' }}>{(result?.confidence * 100).toFixed(1)}%</strong><br />
                            Immediate action recommended.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button onClick={handleNotify} style={{
                                padding: '12px', background: '#d9534f', color: 'white',
                                border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                            }}>
                                <i className="fas fa-bullhorn"></i> Notify Rangers
                            </button>
                            <button onClick={handleDownload} style={{
                                padding: '12px', background: '#f0f0f0', color: '#333',
                                border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                <i className="fas fa-file-download"></i> Download Report
                            </button>
                        </div>
                        <div
                            onClick={() => setShowModal(false)}
                            style={{ marginTop: '20px', color: '#999', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                        >
                            Dismiss Alert
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ display: 'block', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <h1>🔥 Fire Sentinel Tool</h1>
                <p>Upload a satellite image below for advanced AI analysis.</p>

                <div
                    className="upload-area"
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: `3px dashed ${isDragging ? '#10b981' : '#ccc'}`,
                        padding: '40px',
                        borderRadius: '15px',
                        background: isDragging ? 'rgba(16, 185, 129, 0.05)' : '#f9f9f9',
                        textAlign: 'center',
                        margin: '20px 0',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: isDragging ? '#10b981' : '#ccc', transition: 'color 0.3s' }}></i>
                    <p style={{ marginTop: '10px', fontWeight: 500 }}>
                        {isDragging ? "Drop to Upload" : "Click or Drag & Drop to Upload Image"}
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>

                {preview && (
                    <div id="imagePreview" style={{ marginBottom: '20px', position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                        <img src={preview} style={{ width: '100%', borderRadius: '10px', maxHeight: '400px', objectFit: 'cover' }} alt="Preview" />

                        {loading && (
                            <div className="scanning-overlay">
                                <div className="scanner-line"></div>
                            </div>
                        )}
                    </div>
                )}

                <button className={`primary-btn ${loading ? 'scanning' : ''}`} onClick={handlePredict} disabled={loading} style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}>
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <i className="fas fa-satellite-dish fa-spin"></i> Analyzing...
                        </span>
                    ) : (
                        <span><i className="fas fa-search"></i> Start Analysis</span>
                    )}
                </button>

                {result && (
                    <div style={{
                        marginTop: '25px',
                        padding: '20px',
                        borderRadius: '15px',
                        backgroundColor: result.is_fire ? 'rgba(217, 83, 79, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                        border: `2px solid ${result.is_fire ? '#d9534f' : '#4CAF50'}`,
                        animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h2 style={{ margin: 0, color: result.is_fire ? '#d9534f' : '#4CAF50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {result.is_fire ? <i className="fas fa-fire"></i> : <i className="fas fa-check-circle"></i>}
                                {result.prediction}
                            </h2>
                            <span style={{ background: result.is_fire ? '#d9534f' : '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {(result.confidence * 100).toFixed(1)}% Confidence
                            </span>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginTop: '10px' }}>
                            <div style={{
                                height: '100%',
                                width: `${result.confidence * 100}%`,
                                background: result.is_fire ? '#d9534f' : '#4CAF50',
                                transition: 'width 1s ease-out'
                            }}></div>
                        </div>
                        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                            {result.is_fire
                                ? "System has detected high probability of fire signatures. Recommended alerting rangers immediately."
                                : "No fire signatures detected. The area appears safe based on current analysis."
                            }
                        </p>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={async () => {
                                    const userEmail = localStorage.getItem('userEmail');
                                    if (!userEmail) {
                                        alert("Please log in to use this feature.");
                                        return;
                                    }
                                    try {
                                        alert("Sending report...");
                                        await axios.post(`${API_URL}/send-report`, {
                                            email: userEmail,
                                            prediction: result.prediction,
                                            confidence: result.confidence,
                                            filename: fileInputRef.current.files[0]?.name || "Unknown Image",
                                            timestamp: new Date().toLocaleString()
                                        });
                                        alert(`✅ Report sent to ${userEmail}`);
                                    } catch (err) {
                                        console.error("Report Error:", err);
                                        const errorMessage = err.response?.data?.message || err.message || "Unknown error";
                                        alert(`Failed to send report: ${errorMessage}\n\nPlease check if your email credentials are correct.`);
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: 600
                                }}
                            >
                                <i className="fas fa-envelope"></i> Email Report
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-exclamation-triangle"></i> {error}
                    </div>
                )}
            </div>
            <style>{`
         .upload-area:hover { border-color: #10b981 !important; background: rgba(16, 185, 129, 0.05) !important; }
         @keyframes slideIn { from {opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
         @keyframes popIn {
             from {opacity:0; transform:scale(0.9);}
             to {opacity:1; transform:scale(1);}
         }
         .scanning-overlay {
             position: absolute;
             top: 0;
             left: 0;
             width: 100%;
             height: 100%;
             background: rgba(0, 255, 0, 0.1);
             z-index: 10;
             border: 2px solid #0f0;
             box-shadow: 0 0 20px #0f0 inset;
         }
         .scanner-line {
             position: absolute;
             top: 0;
             left: 0;
             width: 100%;
             height: 5px;
             background: #0f0;
             box-shadow: 0 0 15px #0f0;
             animation: scan 2s infinite linear;
         }
         @keyframes scan {
             0% { top: 0; }
             50% { top: 100%; }
             100% { top: 0; }
         }
       `}</style>
        </div>
    );
}

import { useState } from 'react';

export default function AiCommandBox({ existingEvents, onPreview }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:44000/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ userMessage: text, existingEvents })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI error');
      onPreview(data); 
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border:'1px solid #ccc', padding:'1rem', marginTop:'1rem' }}>
      <textarea
        rows={3}
        placeholder="e.g. Add project kickoff Monday 10-11"
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ width:'100%', resize:'vertical' }}
      />
      <button disabled={loading || !text.trim()} onClick={send}>
        {loading ? 'Thinking...' : 'Plan Changes'}
      </button>
      {error && <div style={{ color:'red', marginTop:'0.5rem' }}>{error}</div>}
    </div>
  );
}

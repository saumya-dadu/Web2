import { useState } from 'react';
import { getJoinee } from '../services/ApiService.js';
import { JoineeDetails } from './JoineeRegistration.jsx';

export default function JoineeVerification() {
  const [psId, setPsId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, text, joinee }

  const handleSearch = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    const { ok, status, data } = await getJoinee(psId);          // GET from Spring Boot
    setLoading(false);

    if (ok) {
      setResult({ ok: true, text: `Record found (HTTP ${status})`, joinee: data });
    } else {
      setResult({ ok: false, text: `${data.message} (HTTP ${status || 'no response'})` });
    }
  };

  return (
    <section className="card">
      <h2>Check Joinee Details</h2>
      <form onSubmit={handleSearch}>
        <label>PS ID</label>
        <input value={psId} onChange={(e) => setPsId(e.target.value)} disabled={loading} required />
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search / Verify'}</button>
      </form>

      {result && (
        <div className={`message ${result.ok ? 'success' : 'error'}`}>
          {result.text}
          {result.joinee && <JoineeDetails joinee={result.joinee} />}
        </div>
      )}
    </section>
  );
}

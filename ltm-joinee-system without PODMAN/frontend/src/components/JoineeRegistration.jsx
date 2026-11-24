import { useState } from 'react';
import { registerJoinee } from '../services/ApiService.js';

const EMPTY = { joineeName: '', psId: '', projectId: '', projectName: '' };

export default function JoineeRegistration() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, text, joinee }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    const { ok, status, data } = await registerJoinee(form);   // POST to Spring Boot
    setLoading(false);

    if (ok) {
      setResult({ ok: true, text: `Registered successfully (HTTP ${status})`, joinee: data });
      setForm(EMPTY);                                           // clear form only on success
    } else {
      setResult({ ok: false, text: `${data.message} (HTTP ${status || 'no response'})` });
    }
  };

  return (
    <section className="card">
      <h2>Joinee Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>Joinee Name</label>
        <input name="joineeName" value={form.joineeName} onChange={handleChange} disabled={loading} />
        <label>PS ID</label>
        <input name="psId" value={form.psId} onChange={handleChange} disabled={loading} />
        <label>Project ID</label>
        <input name="projectId" value={form.projectId} onChange={handleChange} disabled={loading} />
        <label>Project Name</label>
        <input name="projectName" value={form.projectName} onChange={handleChange} disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
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

export function JoineeDetails({ joinee }) {
  return (
    <ul className="details">
      <li><b>Name:</b> {joinee.joineeName}</li>
      <li><b>PS ID:</b> {joinee.psId}</li>
      <li><b>Project ID:</b> {joinee.projectId}</li>
      <li><b>Project Name:</b> {joinee.projectName}</li>
    </ul>
  );
}

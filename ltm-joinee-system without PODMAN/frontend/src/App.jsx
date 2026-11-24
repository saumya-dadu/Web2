import JoineeRegistration from './components/JoineeRegistration.jsx';
import JoineeVerification from './components/JoineeVerification.jsx';

export default function App() {
  return (
    <>
      <header className="hero">
        <h1>Welcome to LTM</h1>
        <p>Joinee Registration &amp; Verification</p>
      </header>
      <main className="grid">
        <JoineeRegistration />
        <JoineeVerification />
      </main>
    </>
  );
}

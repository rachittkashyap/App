export default function VerifyCertificate() {
  return (
    <div className="container section">
      <h1>Certificate Verification</h1>
      <p>Enter a certificate ID to check its validity (implemented in Phase 8).</p>
      <input type="text" placeholder="Certificate ID" />
      <button className="btn" style={{ marginLeft: 8 }}>
        Verify
      </button>
    </div>
  );
}

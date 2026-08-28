export default function Login() {
  return (
    <div className="form-page">
      <h2>Login</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button className="btn" type="submit">
          Login
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        Auth logic will be wired up in Phase 2.
      </p>
    </div>
  );
}

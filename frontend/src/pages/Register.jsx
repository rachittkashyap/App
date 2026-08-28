export default function Register() {
  return (
    <div className="form-page">
      <h2>Create Account</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <input type="password" placeholder="Confirm Password" required />
        <button className="btn" type="submit">
          Register
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        Registration logic will be wired up in Phase 2.
      </p>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <div className="form-page">
      <h2>Forgot Password</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Enter your email" required />
        <button className="btn" type="submit">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}

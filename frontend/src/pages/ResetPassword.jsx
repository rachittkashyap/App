export default function ResetPassword() {
  return (
    <div className="form-page">
      <h2>Reset Password</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="password" placeholder="New Password" required />
        <input type="password" placeholder="Confirm New Password" required />
        <button className="btn" type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
}

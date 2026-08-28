export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Training Platform. All rights reserved.</p>
        <p>
          <a href="/terms">Terms</a> · <a href="/privacy">Privacy Policy</a> ·{' '}
          <a href="/refund-policy">Refund Policy</a>
        </p>
      </div>
    </footer>
  );
}

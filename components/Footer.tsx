export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p>© {year} Melroy · All rights reserved · Payments secured by Razorpay</p>
    </footer>
  );
}

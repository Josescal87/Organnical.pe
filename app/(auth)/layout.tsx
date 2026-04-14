// Auth pages (login, registro) have their own full-screen layout — no Navbar or Footer.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

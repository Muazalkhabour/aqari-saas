export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen text-slate-900 antialiased">
      {children}
    </div>
  )
}

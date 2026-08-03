// login/page.tsx is a client component and cannot export metadata itself.
export const metadata = { title: "Sign in" };

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

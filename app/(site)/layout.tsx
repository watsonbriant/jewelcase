import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="jc-page">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

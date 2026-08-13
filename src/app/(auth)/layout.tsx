import { LogoAuth } from "@/components/common/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6 py-8">
        <div className="mb-10 flex justify-center">
          <LogoAuth />
        </div>
        {children}
      </div>
    </div>
  );
}

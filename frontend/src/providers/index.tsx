import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";
import { SyncProvider } from "./SyncProvider";
import { ThemePickerModal } from "@/components/common/ThemePickerModal";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ThemePickerModal />
        <Toaster position="bottom-right" richColors closeButton />
        <SyncProvider />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

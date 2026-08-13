import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { ThemePickerModal } from "@/components/common/ThemePickerModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemePickerModal />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

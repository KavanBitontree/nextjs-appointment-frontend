import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import AarogyaAssistant from "@/components/chatbot/AarogyaAssistant";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          <AuthProvider>
            {children}
            <AarogyaAssistant />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

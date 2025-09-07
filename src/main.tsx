import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import { PersonalizationProvider } from "./contexts/PersonalizationContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { I18nProvider } from "./contexts/I18nContext";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <AccessibilityProvider>
        <PersonalizationProvider>
          <ThemeProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </ThemeProvider>
        </PersonalizationProvider>
      </AccessibilityProvider>
    </I18nProvider>
  </StrictMode>
);

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CLUBE DO RAUL | Esquenta Carnaval 2026" },
      { name: "description", content: "Clube do Raul apresenta Esquenta Carnaval 2026. Novo Hit + Thiago Paraguassu + Daneil Bonner. Garanta seu ingresso agora." },
      { name: "author", content: "Clube do Raul" },
      { property: "og:title", content: "CLUBE DO RAUL | Esquenta Carnaval 2026" },
      { property: "og:description", content: "Clube do Raul apresenta Esquenta Carnaval 2026. Novo Hit + Thiago Paraguassu + Daneil Bonner. Garanta seu ingresso agora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "theme-color", content: "#FF4500" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "CLUBE DO RAUL" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=Anton&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [deferredPrompt, setDeferredPrompt] = useEffect.useState<any>(null);
  const [showInstallLink, setShowInstallLink] = useEffect.useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Register Service Worker
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((reg) => console.log("SW registered:", reg))
            .catch((err) => console.log("SW error:", err));
        });
      }

      // Intercept PWA Install Prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallLink(true);
      });

      // Handle successful installation
      window.addEventListener("appinstalled", () => {
        setDeferredPrompt(null);
        setShowInstallLink(false);
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallLink(false);
      }
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {showInstallLink ? (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-700">
            <img src="/favicon.png" alt="App Icon" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-['Archivo_Black'] text-primary mb-2">CLUBE DO RAUL</h1>
          <p className="text-muted-foreground mb-8 max-w-xs">
            Instale o nosso aplicativo para uma experiência completa e acesso rápido aos ingressos.
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,69,0,0.3)] transition-all active:scale-95 mb-4"
          >
            INSTALAR APLICATIVO
          </button>
          <button
            onClick={() => setShowInstallLink(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continuar para o site
          </button>
        </div>
      ) : (
        <Outlet />
      )}
    </QueryClientProvider>
  );
}


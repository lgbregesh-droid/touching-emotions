import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
      <div className="text-center">
        <h1 className="text-7xl font-light text-[#2D1B3D]">404</h1>
        <p className="mt-3 text-[#A0907A]">Page not found</p>
        <a href="/" className="mt-6 inline-block px-6 py-2 rounded-full bg-[#BA9B78] text-white text-sm">Home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl text-[#2D1B3D]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#A0907A]">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 px-6 py-2 rounded-full bg-[#BA9B78] text-white text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "לגעת ברגש — העצמה ובניית חוסן רגשי" },
      { name: "description", content: "עמותת לגעת ברגש — סדנאות חוסן רגשי, העצמה אישית ותוכניות מותאמות לבתי ספר וארגונים." },
      { property: "og:title", content: "לגעת ברגש" },
      { property: "og:description", content: "העצמה ובניית חוסן רגשי לילדים — סדנאות שנבנות יחד איתכם." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Heebo:wght@200;300;400;500;700&family=Playfair+Display:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
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

function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  const isHome = loc.pathname === "/";
  if (isAdmin) {
    return (
      <>
        {children}
        <Toaster richColors position="top-center" />
      </>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8]">
      <Navbar />
      <main className={`flex-1 ${isHome ? "" : "pt-16 md:pt-20"}`}>{children}</main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Layout>
          <Outlet />
        </Layout>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

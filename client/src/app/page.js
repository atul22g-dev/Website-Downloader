import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import DownloadForm from "@/components/DownloadForm";
import Features from "@/components/Features";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ThemeToggle />

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center p-6 sm:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-linear-to-br from-[#667eea] to-[#764ba2] opacity-[0.04] dark:opacity-[0.08]" />

          <Logo />

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-(--text) sm:mt-5 sm:text-3xl md:text-4xl">
            Website Downloader
          </h1>

          <p className="mb-6 mt-2 max-w-xs text-xs leading-relaxed text-(--text-secondary) sm:mb-8 sm:max-w-sm sm:text-sm md:text-base">
            Download any website&apos;s source code and assets for offline viewing
          </p>

          <DownloadForm />

          <Features />
        </div>
      </main>

      <footer className="pb-[env(safe-area-inset-bottom)] pt-4 text-center text-[0.7rem] text-(--text-muted) sm:text-xs">
        Powered by{" "}
        <a
          href="https://www.gnu.org/software/wget/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--primary) no-underline hover:underline"
        >
          wget
        </a>{" "}
        &middot; Built with Next.js &amp; Socket.IO
      </footer>
    </div>
  );
}

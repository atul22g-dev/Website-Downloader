"use client";

import { useState, useCallback } from "react";
import { DownloadArrow, GlobeIcon, FileIcon } from "./Icons";
import { useSocket } from "@/lib/useSocket";

export default function DownloadForm() {
  const { startDownload, cleanup } = useSocket();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [fileCount, setFileCount] = useState(0);
  const [zipFile, setZipFile] = useState(null);

  const handleEvent = useCallback((event) => {
    if (event.error) {
      setStatus("error");
      setMessage(event.error);
      return;
    }
    if (event.progress === "Converting") {
      setStatus("converting");
      setMessage("100%! Compressing your website...");
      return;
    }
    if (event.progress === "Completed") {
      setStatus("completed");
      setMessage("Compression completed successfully!");
      setZipFile(event.file);
      return;
    }
    setStatus("downloading");
    if (event.progress && event.progress.includes("200 OK")) {
      setFileCount((c) => c + 1);
    }
    setMessage(event.progress || "");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    cleanup();
    setStatus("downloading");
    setMessage("");
    setFileCount(0);
    setZipFile(null);
    startDownload(url, handleEvent);
  };

  const isBusy = status === "downloading" || status === "converting";

  return (
    <div className="w-full rounded-2xl bg-(--surface) p-4 shadow-(--shadow-lg) transition-all duration-300 sm:p-5">
      <form onSubmit={handleSubmit} className="w-full">
        {/* Mobile: stacked vertical layout. Desktop: inline horizontal. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:border-[1.5px] sm:border-(--border) sm:transition-all sm:duration-200 sm:focus-within:border-(--primary) sm:focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]">
          {/* Globe icon: hidden on mobile */}
          <GlobeIcon size={20} />

          <label htmlFor="website-url" className="sr-only">
            Website URL
          </label>
          <input
            id="website-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoComplete="url"
            spellCheck="false"
            className="w-full min-w-0 flex-1 border-[1.5px] border-(--border) bg-transparent px-4 py-3 text-base text-(--text) outline-none placeholder:text-(--text-muted) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] sm:border-none sm:px-3 sm:py-3.5 sm:focus:shadow-none"
          />

          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--primary) px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:not-disabled:bg-(--primary-hover) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:shrink-0 sm:rounded-md sm:px-[22px] sm:py-2.5"
          >
            {isBusy ? (
              <>
                <span className="inline-block h-4 w-4 animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-white/30 border-t-white" />
                Downloading...
              </>
            ) : (
              <>
                <DownloadArrow size={20} />
                Download
              </>
            )}
          </button>
        </div>
      </form>

      {isBusy && (
        <div className="mt-4 h-1 w-full overflow-hidden rounded bg-(--border)">
          <div
            className="h-full rounded bg-linear-to-r from-[#667eea] to-[#764ba2] transition-all duration-300"
            style={{
              width: status === "converting" ? "100%" : "40%",
              marginLeft: status === "converting" ? 0 : "30%",
              animation: status === "downloading" ? "progress-indeterminate 1.5s ease-in-out infinite" : "none",
            }}
          />
        </div>
      )}

      <div className="mt-3 min-h-6 w-full sm:mt-4 sm:min-h-8">
        {status === "error" && (
          <p className="break-all text-center text-xs font-medium text-(--error) sm:text-sm">
            {message}
          </p>
        )}
        {status === "completed" && (
          <p className="text-center text-xs font-medium text-(--success) sm:text-sm">
            Compression completed successfully!
          </p>
        )}
        {(status === "downloading" || status === "converting") && (
          <p className="break-all text-center text-xs text-(--text-secondary) sm:text-sm">
            {message}
          </p>
        )}
        {status !== "idle" && fileCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 text-[0.7rem] text-(--text-muted) sm:text-xs">
            <FileIcon />
            <span>
              Files downloaded: <strong className="font-semibold text-(--primary)">{fileCount}</strong>
            </span>
          </div>
        )}
      </div>

      {status === "completed" && zipFile && (
        <div className="mt-4 text-center sm:mt-5">
          <a
            href={"/sites/" + zipFile + ".zip"}
            className="inline-flex items-center gap-2 rounded-lg bg-(--success) px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#15803d] hover:shadow-[0_6px_20px_rgba(22,163,74,0.35)] active:translate-y-0 sm:px-7 sm:text-[0.95rem]"
          >
            <DownloadArrow size={18} />
            Save ZIP to Disk
          </a>
        </div>
      )}
    </div>
  );
}

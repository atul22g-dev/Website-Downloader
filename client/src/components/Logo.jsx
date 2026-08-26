import { DownloadArrow } from "./Icons";

export default function Logo() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_8px_30px_rgba(102,126,234,0.35)] sm:h-20 sm:w-20 sm:rounded-[20px]">
      <DownloadArrow size={32} strokeWidth={1.5} />
    </div>
  );
}

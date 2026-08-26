const features = [
  {
    label: "Full Source Code",
    icon: (
      <>
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </>
    ),
  },
  {
    label: "Images & Assets",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </>
    ),
  },
  {
    label: "Offline Ready",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
];

export default function Features() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:mt-8 sm:gap-x-6 sm:gap-y-3">
      {features.map((f) => (
        <div key={f.label} className="flex items-center gap-1 text-[0.7rem] text-(--text-muted) sm:gap-1.5 sm:text-xs">
          <svg className="opacity-60" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {f.icon}
          </svg>
          <span>{f.label}</span>
        </div>
      ))}
    </div>
  );
}

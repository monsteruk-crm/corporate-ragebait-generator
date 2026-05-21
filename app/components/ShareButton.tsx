type ShareButtonProps = {
  onClick: () => void;
};

export function ShareButton({ onClick }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Share on LinkedIn
    </button>
  );
}

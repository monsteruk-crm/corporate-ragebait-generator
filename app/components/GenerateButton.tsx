type GenerateButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
};

export function GenerateButton({ onClick, isLoading = false }: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
    >
      {isLoading ? "Generating..." : "Generate Ragebait Post"}
    </button>
  );
}

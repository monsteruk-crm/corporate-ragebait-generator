type PublishButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
};

export function PublishButton({ onClick, isLoading = false }: PublishButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
    >
      {isLoading ? "Publishing..." : "Publish Share Page"}
    </button>
  );
}

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-card h-36 animate-pulse rounded-(--radius-card) border" />
      ))}
    </div>
  );
}

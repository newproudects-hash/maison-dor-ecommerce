export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#082215] rounded-full animate-spin"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 animate-pulse">Chargement...</p>
      </div>
    </main>
  );
}

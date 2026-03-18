export default function GridIcon() {
  return (
    <div className="grid grid-cols-2 gap-0.5 w-6 h-6" aria-hidden="true">
      <div className="bg-slate-200 rounded-sm" />
      <div className="bg-slate-200 rounded-sm" />
      <div className="bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-sm" />
      <div className="bg-slate-200 rounded-sm" />
    </div>
  );
}
interface AdminDataTableProps {
  children: React.ReactNode;
  minWidth?: string;
}

export default function AdminDataTable({
  children,
  minWidth = "640px",
}: AdminDataTableProps) {
  return (
    <div className="relative -mx-4 sm:mx-0">
      <div className="overflow-x-auto overscroll-x-contain px-4 sm:px-0 pb-1">
        <div
          className="bg-cream border border-wood/10 inline-block min-w-full align-middle"
          style={{ minWidth }}
        >
          {children}
        </div>
      </div>
      <p className="text-[10px] text-stone/80 text-center mt-2 sm:hidden">
        Tabelle horizontal wischen
      </p>
    </div>
  );
}

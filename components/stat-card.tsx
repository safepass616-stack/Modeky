import clsx from 'clsx';

export default function StatCard({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: number | string;
  accent?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const accentClasses: Record<string, string> = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={clsx('mt-2 text-3xl font-bold', accentClasses[accent])}>{value}</p>
    </div>
  );
}

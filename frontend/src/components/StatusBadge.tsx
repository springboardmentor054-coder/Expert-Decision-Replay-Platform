const MAP: Record<string, string> = {
  open: 'badge-open',
  in_review: 'badge-in_review',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  pending: 'badge-pending',
  unread: 'badge-unread',
  read: 'badge-read',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] ?? 'badge bg-gray-100 text-gray-600'
  return <span className={cls}>{status.replace('_', ' ')}</span>
}

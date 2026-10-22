import { PackageOpen, Sparkles } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', description = 'Try a different search or add your first record.' }) {
    return <div className="empty-state"><div className="empty-state-art" aria-hidden="true"><span /><PackageOpen size={30} strokeWidth={1.2} /><Sparkles size={13} /></div><h3>{title}</h3><p>{description}</p></div>;
}

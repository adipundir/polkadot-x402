import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card h-full">
      <div className="w-12 h-12 mb-6 rounded-full border border-[color:var(--tone-border)] flex items-center justify-center text-[color:var(--tone-light)]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[color:var(--tone-light)] mb-3">{title}</h3>
      <p className="text-[color:var(--tone-muted)] leading-relaxed">{description}</p>
    </div>
  );
}


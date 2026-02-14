import { getMatchTypeConfig } from '../../lib/copy';

interface MatchTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchTypeBadge = ({ type, size = 'md' }: MatchTypeBadgeProps) => {
  const config = getMatchTypeConfig(type);
  
  const sizeClasses = {
    sm: 'match-badge-sm',
    md: 'match-badge-md',
    lg: 'match-badge-lg'
  };
  
  return (
    <span 
      className={`match-badge ${sizeClasses[size]}`}
      style={{ backgroundColor: config.color }}
    >
      <span className="match-badge-icon">{config.icon}</span>
      <span className="match-badge-text">{config.label}</span>
    </span>
  );
};

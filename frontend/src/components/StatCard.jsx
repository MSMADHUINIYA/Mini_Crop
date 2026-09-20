import { HiArrowUp, HiArrowDown, HiMinus } from 'react-icons/hi2';
import './StatCard.css';

function StatCard({ icon, label, value, trend, trendValue, color = 'green' }) {
  const trendDirection = trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'neutral';
  const TrendIcon = trend === 'up' ? HiArrowUp : trend === 'down' ? HiArrowDown : HiMinus;

  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {icon}
        </div>
        {trendValue && (
          <span className={`stat-card-trend ${trendDirection}`}>
            <TrendIcon size={12} />
            {trendValue}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export default StatCard;

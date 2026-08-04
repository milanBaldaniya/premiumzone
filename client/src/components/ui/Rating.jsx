import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function Rating({ value = 0, count, size = 'text-sm' }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i + 1 <= Math.floor(value);
    const half = !filled && i + 0.5 <= value;
    return filled ? FaStar : half ? FaStarHalfAlt : FaRegStar;
  });

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex text-accent">
        {stars.map((Icon, i) => (
          <Icon key={i} />
        ))}
      </div>
      {count != null && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
}

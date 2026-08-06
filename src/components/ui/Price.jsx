export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Price({ price, discountPrice, size = 'md' }) {
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const sizes = { sm: 'text-md', md: 'text-lg', lg: 'text-2xl' };
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-display font-semibold text-gold-300 ${sizes[size]}`}>
        {formatINR(hasDiscount ? discountPrice : price)}
      </span>
      {hasDiscount && (
        <span className="text-xs text-ink-inverse line-through">{formatINR(price)}</span>
      )}
    </div>
  );
}

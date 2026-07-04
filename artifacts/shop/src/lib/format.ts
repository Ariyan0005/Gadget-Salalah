export function formatPrice(price: number): string {
  return `OMR ${price.toLocaleString('en-OM', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
}

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

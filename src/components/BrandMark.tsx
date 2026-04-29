interface BrandMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 rounded-lg',
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-10 w-10 rounded-2xl',
  lg: 'h-14 w-14 rounded-2xl',
  hero: 'h-16 w-16 rounded-3xl sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28',
};

export function BrandMark({ size = 'md', className = '' }: BrandMarkProps) {
  return (
    <img
      src="/brand/logo.png"
      alt="Tightly logo"
      className={`${sizeClasses[size]} object-cover shadow-lg shadow-primary/20 ${className}`}
      draggable={false}
    />
  );
}

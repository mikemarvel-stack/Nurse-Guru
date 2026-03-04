import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  className, 
  fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-gray-100', className)}>
      <img
        src={inView ? src : fallback}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          error && 'opacity-50'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
    </div>
  );
}

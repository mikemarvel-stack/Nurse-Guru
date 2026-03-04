import { Suspense, lazy, ComponentType } from 'react';
import { Spinner } from '@/components/ui/spinner';

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner className="h-8 w-8" />
    </div>
  )
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

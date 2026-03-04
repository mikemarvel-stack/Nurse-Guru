import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface TrendingSearch {
  term: string;
  count: number;
}

export function TrendingSearches() {
  const [trending, setTrending] = useState<TrendingSearch[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/seo/trending`)
      .then(res => res.json())
      .then(data => setTrending(data.trending))
      .catch(() => {});
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold">Trending Subjects</h2>
      </div>
      <div className="space-y-2">
        {trending.map(({ term, count }) => (
          <Link
            key={term}
            to={`/browse?subject=${encodeURIComponent(term)}`}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <span className="text-gray-700">{term}</span>
            <span className="text-sm text-gray-500">{count} sales</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

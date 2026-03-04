import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';

interface PopularTag {
  tag: string;
  count: number;
}

export function PopularTags() {
  const [tags, setTags] = useState<PopularTag[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/seo/tags/popular`)
      .then(res => res.json())
      .then(data => setTags(data.tags.slice(0, 20)))
      .catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Popular Tags</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag }) => (
          <Link
            key={tag}
            to={`/browse?tags=${encodeURIComponent(tag)}`}
            className="px-3 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full text-sm transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

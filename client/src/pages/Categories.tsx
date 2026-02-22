import { Link } from 'react-router-dom';
import { 
  FileText, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  FlaskConical,
  Scroll,
  Presentation,
  ClipboardList,
  Library,
  StickyNote
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/seo/SEO';
import { useDocumentStore, documentCategories } from '@/store';

const categoryIcons: Record<string, React.ElementType> = {
  'research-papers': FileText,
  'theses': Scroll,
  'essays': ClipboardList,
  'case-studies': TrendingUp,
  'presentations': Presentation,
  'study-guides': BookOpen,
  'lab-reports': FlaskConical,
  'dissertations': GraduationCap,
  'textbooks': Library,
  'notes': StickyNote
};

export function Categories() {
  const { documents } = useDocumentStore();

  const getCategoryCount = (category: string) => {
    return documents.filter(d => d.category === category && d.status === 'approved').length;
  };

  return (
    <>
      <SEO data={{
        title: 'Browse Categories - AcadMarket',
        description: 'Explore academic documents by category. Find research papers, theses, study guides, case studies, and more.',
        keywords: ['categories', 'academic documents', 'research papers', 'theses', 'study guides', 'browse'],
        canonicalUrl: 'https://acadmarket.com/categories'
      }} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Browse Categories</h1>
          <p className="mt-2 text-gray-600">
            Explore our collection of academic documents organized by category
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documentCategories.map((category) => {
            const Icon = categoryIcons[category.value] || FileText;
            const count = getCategoryCount(category.value);
            
            return (
              <Link key={category.value} to={`/browse?category=${category.value}`}>
                <Card className="group h-full cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col items-center p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {category.label}
                    </h3>
                    <Badge className="mt-4" variant="secondary">
                      {count} documents
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Popular Subjects */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Popular Subjects</h2>
          <p className="mt-2 text-gray-600">Find documents in your field of study</p>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              'Computer Science',
              'Business Administration',
              'Psychology',
              'Biology',
              'Economics',
              'Medicine',
              'Engineering',
              'Mathematics',
              'Physics',
              'Chemistry',
              'History',
              'Literature',
              'Sociology',
              'Political Science',
              'Environmental Science'
            ].map((subject) => (
              <Link key={subject} to={`/browse?subject=${encodeURIComponent(subject)}`}>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600"
                >
                  {subject}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Academic Levels */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Academic Levels</h2>
          <p className="mt-2 text-gray-600">Documents tailored to your educational level</p>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { value: 'high-school', label: 'High School', description: 'Perfect for AP and honors students' },
              { value: 'undergraduate', label: 'Undergraduate', description: 'College and university level' },
              { value: 'graduate', label: 'Graduate', description: 'Master\'s degree programs' },
              { value: 'phd', label: 'PhD', description: 'Doctoral research and dissertations' },
              { value: 'professional', label: 'Professional', description: 'Industry and career focused' }
            ].map((level) => (
              <Link key={level.value} to={`/browse?level=${level.value}`}>
                <Card className="group cursor-pointer transition-all hover:border-blue-500 hover:shadow-md">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {level.label}
                    </h3>
                    <p className="mt-1 text-xs text-gray-600">{level.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

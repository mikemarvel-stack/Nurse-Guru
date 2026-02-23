import { useState } from 'react';
import { Download, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentPreviewProps {
  title: string;
  fileType: string;
  previewPages: number;
  onClose: () => void;
  onDownload?: () => void;
}

export function DocumentPreview({ 
  title, 
  fileType, 
  previewPages,
  onClose, 
  onDownload 
}: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Mock page count for preview - in real app, this would come from backend
  const totalPages = Math.min(previewPages, 5);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Preview - Page {currentPage} of {totalPages}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded shadow-lg transition-transform"
            style={{ 
              width: `${zoom}%`,
              maxWidth: 'calc(100% - 32px)'
            }}
          >
            {/* Mock Document Preview */}
            <div className="aspect-[8.5/11] bg-gradient-to-br from-blue-50 to-slate-50 p-8 flex flex-col justify-between">
              {/* Document Header */}
              <div>
                <div className="h-3 w-24 bg-blue-300 rounded mb-4" />
                <div className="h-2 w-full bg-gray-200 rounded mb-2" />
                <div className="h-2 w-5/6 bg-gray-200 rounded mb-2" />
                <div className="h-2 w-4/5 bg-gray-200 rounded" />
              </div>

              {/* Document Content */}
              <div className="space-y-3">
                <div className="h-2 w-full bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded" />
                <div className="h-2 w-3/4 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded mt-4" />
                <div className="h-2 w-5/6 bg-gray-200 rounded" />
                <div className="h-2 w-4/5 bg-gray-200 rounded" />
              </div>

              {/* Document Footer */}
              <div className="text-center text-xs text-gray-400">
                Page {currentPage} - {title}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600 px-3">
              {currentPage} / {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600 w-12 text-center">
              {zoom}%
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {onDownload && (
              <Button 
                size="sm"
                onClick={onDownload}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>

          <Badge variant="secondary">
            {fileType.toUpperCase()}
          </Badge>
        </div>

        {/* Preview Notice */}
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-xs text-amber-800">
          📄 This is a preview of the first {totalPages} pages. Purchase the document to access the full content.
        </div>
      </div>
    </div>
  );
}

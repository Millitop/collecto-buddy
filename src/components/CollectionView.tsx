import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Download, 
  Share2, 
  Trash2,
  Heart,
  MoreVertical
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface CollectionItem {
  id: string;
  image: string;
  title: string;
  category: string;
  subcategory: string;
  condition: string;
  price_estimate: {
    low: number;
    mid: number;
    high: number;
  };
  added_date: string;
  confidence: number;
}

interface CollectionViewProps {
  items: CollectionItem[];
  onItemSelect: (item: CollectionItem) => void;
  onItemDelete: (id: string) => void;
  onExport: () => void;
  onShare: () => void;
}

export const CollectionView = ({ 
  items, 
  onItemSelect, 
  onItemDelete, 
  onExport, 
  onShare 
}: CollectionViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const totalValue = items.reduce((sum, item) => sum + item.price_estimate.mid, 0);
  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      {/* Mobile Header with Stats and Safe Area */}
      <div className="bg-gradient-hero text-white safe-area-top">
        <div className="p-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Min Samling</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 touch-manipulation min-h-[44px] px-4"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 touch-manipulation min-h-[44px] px-4"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold mb-1">{items.length}</div>
              <div className="text-sm text-white/80">Objekt</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold mb-1">{Math.round(totalValue/1000)}k</div>
              <div className="text-sm text-white/80">SEK</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold mb-1">{categories.length}</div>
              <div className="text-sm text-white/80">Kategorier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search and Filter */}
      <div className="p-4 bg-muted/30 border-b">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Sök i samlingen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 w-12 rounded-xl touch-manipulation">
                <Filter className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 bg-background border">
              <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                Alla kategorier
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          <Badge 
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap touch-manipulation min-h-[36px] px-4"
            onClick={() => setFilterCategory('all')}
          >
            Alla ({items.length})
          </Badge>
          {categories.map(category => {
            const count = items.filter(item => item.category === category).length;
            return (
              <Badge 
                key={category}
                variant={filterCategory === category ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap touch-manipulation min-h-[36px] px-4"
                onClick={() => setFilterCategory(category)}
              >
                {category} ({count})
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Mobile Items Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-8xl mb-6">📱</div>
            <h3 className="text-xl font-medium mb-3">Ingen samling än</h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Börja skanna dina samlarobjekt för att bygga din digitala samling
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="bg-gradient-card shadow-card cursor-pointer hover:shadow-premium transition-all duration-200 touch-manipulation"
                onClick={() => onItemSelect(item)}
              >
                <CardContent className="p-3">
                  <div className="relative mb-3">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-36 object-cover rounded-lg"
                      loading="lazy"
                    />
                    <Badge 
                      className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md"
                    >
                      {Math.round(item.confidence * 100)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2 leading-tight">{item.title}</h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                        {item.category}
                      </span>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {item.condition}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-sm font-semibold text-primary">
                        {Math.round(item.price_estimate.mid/1000)}k SEK
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 touch-manipulation"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50 bg-background border">
                          <DropdownMenuItem className="touch-manipulation">
                            <Heart className="w-4 h-4 mr-2" />
                            Favorit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="touch-manipulation">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Prishistorik
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemDelete(item.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Ta bort
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
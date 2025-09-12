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
    <div className="flex flex-col h-full bg-background">
      {/* Header with Stats */}
      <div className="bg-gradient-hero text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Min Samling</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm text-white/80">Objekt</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalValue.toLocaleString()}</div>
            <div className="text-sm text-white/80">SEK</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-white/80">Kategorier</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-muted/30 border-b">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök i samlingen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

        <div className="flex gap-2 overflow-x-auto">
          <Badge 
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap"
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
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilterCategory(category)}
              >
                {category} ({count})
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Items Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-medium mb-2">Ingen samling än</h3>
            <p className="text-muted-foreground mb-4">
              Börja skanna dina samlarobjekt för att bygga din digitala samling
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="bg-gradient-card shadow-card cursor-pointer hover:shadow-premium transition-all duration-200"
                onClick={() => onItemSelect(item)}
              >
                <CardContent className="p-3">
                  <div className="relative mb-3">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Badge 
                      className="absolute top-2 right-2 bg-black/70 text-white text-xs"
                    >
                      {Math.round(item.confidence * 100)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-primary">
                        {item.price_estimate.mid.toLocaleString()} SEK
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Heart className="w-4 h-4 mr-2" />
                            Favorit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Prishistorik
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
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
import { useState } from 'react';
import { MobileScanner } from '@/components/MobileScanner';
import { CollectionView } from '@/components/CollectionView';
import { SwipeableResult } from '@/components/SwipeableResult';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Folder, Archive, Home } from 'lucide-react';

interface ScannedItem {
  id: string;
  image: string;
  category: string;
  title: string;
  subcategory: string;
  maker_brand: string;
  year_or_period: string;
  set_or_model: string;
  identifiers: string[];
  condition: {
    grade: string;
    notes: string;
  };
  authenticity_flags: string[];
  price_estimate_SEK: {
    low: number;
    mid: number;
    high: number;
    sources: string[];
  };
  next_shots: string[];
  confidence: number;
  added_date: string;
}

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

const Index = () => {
  const [view, setView] = useState<'scanner' | 'result' | 'collection'>('scanner');
  const [currentScanResult, setCurrentScanResult] = useState<ScannedItem | null>(null);
  const [collection, setCollection] = useState<ScannedItem[]>([]);

  const handleItemScanned = (item: any) => {
    // Convert scanned item to full analysis data
    const fullAnalysisData: ScannedItem = {
      id: item.id,
      image: item.image,
      category: item.category,
      subcategory: `${item.category}/Subkategori`,
      title: `${item.category === 'cards' ? 'Charizard 1st Edition' : 'Identifierat objekt'}`,
      maker_brand: item.category === 'cards' ? 'Wizards of the Coast' : 'Okänd tillverkare',
      year_or_period: '1998',
      set_or_model: item.category === 'cards' ? 'Base Set 4/102' : 'Modell okänd',
      identifiers: ['4/102', '©1995, 96, 98 Nintendo', '1st Edition symbol'],
      condition: {
        grade: 'NM',
        notes: 'Mycket fint skick med minimal kantslitage. Inga större repor eller bucklor synliga.'
      },
      authenticity_flags: [
        'Kontrollera äkthet - populärt objekt för förfalskningar',
        'Begär fler bilder för säkrare bedömning'
      ],
      price_estimate_SEK: item.price_estimate || {
        low: 15000,
        mid: 20000,
        high: 25000,
        sources: ['auktion_historik', 'ebay_pwcc']
      },
      next_shots: [
        'Ta en närbild av alla fyra hörn',
        'Fotografera baksidan i bättre ljus',
        'Närbild på identifierande märken'
      ],
      confidence: item.confidence,
      added_date: new Date().toISOString()
    };

    setCurrentScanResult(fullAnalysisData);
    setView('result');
  };

  const handleBatchComplete = (items: any[]) => {
    toast({
      title: 'Batch-skanning klar!',
      description: `${items.length} objekt redo för granskning och analys.`,
    });
    
    // For now, just show the first item
    if (items.length > 0) {
      handleItemScanned(items[0]);
    }
  };

  const handleAddToCollection = () => {
    if (currentScanResult) {
      setCollection(prev => [...prev, currentScanResult]);
      toast({
        title: 'Tillagt i samling!',
        description: `${currentScanResult.title} har lagts till i din samling.`,
      });
      setCurrentScanResult(null);
      setView('scanner');
    }
  };

  const handleViewDetails = () => {
    // Could navigate to detailed analysis view
    toast({
      title: 'Detaljanalys',
      description: 'Utförlig analys visas här...',
    });
  };

  const handleDismiss = () => {
    setCurrentScanResult(null);
    setView('scanner');
  };

  const convertToCollectionItem = (scannedItem: ScannedItem): CollectionItem => ({
    id: scannedItem.id,
    image: scannedItem.image,
    title: scannedItem.title,
    category: scannedItem.category,
    subcategory: scannedItem.subcategory,
    condition: scannedItem.condition.grade,
    price_estimate: {
      low: scannedItem.price_estimate_SEK.low,
      mid: scannedItem.price_estimate_SEK.mid,
      high: scannedItem.price_estimate_SEK.high,
    },
    added_date: scannedItem.added_date,
    confidence: scannedItem.confidence,
  });

  const handleItemSelect = (item: CollectionItem) => {
    // Find the full scanned item from collection
    const fullItem = collection.find(c => c.id === item.id);
    if (fullItem) {
      setCurrentScanResult(fullItem);
      setView('result');
    }
  };

  const handleItemDelete = (id: string) => {
    setCollection(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Objekt borttaget',
      description: 'Objektet har tagits bort från din samling.',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export startar',
      description: 'Din samling exporteras till CSV/Excel...',
    });
  };

  const handleShare = () => {
    toast({
      title: 'Delningslänk skapad',
      description: 'Länk till din samling har kopierats.',
    });
  };

  if (view === 'scanner') {
    return (
      <div className="relative">
        <MobileScanner 
          onItemScanned={handleItemScanned}
          onBatchComplete={handleBatchComplete}
        />
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex justify-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('scanner')}
              className="flex flex-col items-center gap-1"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Skanna</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('collection')}
              className="flex flex-col items-center gap-1"
            >
              <Folder className="w-5 h-5" />
              <span className="text-xs">Samling ({collection.length})</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'collection') {
    return (
      <div className="relative">
        <CollectionView
          items={collection.map(convertToCollectionItem)}
          onItemSelect={handleItemSelect}
          onItemDelete={handleItemDelete}
          onExport={handleExport}
          onShare={handleShare}
        />
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex justify-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('scanner')}
              className="flex flex-col items-center gap-1"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Skanna</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('collection')}
              className="flex flex-col items-center gap-1"
            >
              <Folder className="w-5 h-5" />
              <span className="text-xs">Samling ({collection.length})</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result' && currentScanResult) {
    return (
      <SwipeableResult
        data={currentScanResult}
        image={currentScanResult.image}
        onSwipeUp={handleAddToCollection}
        onSwipeRight={handleViewDetails}
        onSwipeLeft={handleDismiss}
        onBack={() => setView('scanner')}
      />
    );
  }

  return null;
};

export default Index;

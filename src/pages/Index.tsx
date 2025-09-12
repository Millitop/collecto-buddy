import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileScanner } from '@/components/MobileScanner';
import { CollectionView } from '@/components/CollectionView';
import { SwipeableResult } from '@/components/SwipeableResult';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';
import { Item, AnalysisData } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { exportService } from '@/lib/exportService';
import { Folder, Home, LogOut, User } from 'lucide-react';

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
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { items, addItem, deleteItem, loading: itemsLoading } = useItems(user?.id);
  const [view, setView] = useState<'scanner' | 'result' | 'collection'>('scanner');
  const [currentScanResult, setCurrentScanResult] = useState<AnalysisData & { images: string[] } | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const handleItemScanned = (item: any) => {
    // Convert scanned item to analysis data format
    const analysisData: AnalysisData & { images: string[] } = {
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
      images: [item.image]
    };

    setCurrentScanResult(analysisData);
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

  const handleAddToCollection = async () => {
    if (!currentScanResult) return;

    const itemData = {
      category: currentScanResult.category,
      subcategory: currentScanResult.subcategory,
      title: currentScanResult.title,
      maker_brand: currentScanResult.maker_brand,
      year_or_period: currentScanResult.year_or_period,
      set_or_model: currentScanResult.set_or_model,
      identifiers: currentScanResult.identifiers,
      condition_grade: currentScanResult.condition.grade,
      condition_notes: currentScanResult.condition.notes,
      authenticity_flags: currentScanResult.authenticity_flags,
      price_low: currentScanResult.price_estimate_SEK.low,
      price_mid: currentScanResult.price_estimate_SEK.mid,
      price_high: currentScanResult.price_estimate_SEK.high,
      images: currentScanResult.images,
      confidence: currentScanResult.confidence,
    };

    const result = await addItem(itemData);
    if (!result.error) {
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

  const convertToCollectionItem = (item: Item): CollectionItem => ({
    id: item.id,
    image: item.images[0] || '',
    title: item.title,
    category: item.category,
    subcategory: item.subcategory || '',
    condition: item.condition_grade,
    price_estimate: {
      low: item.price_low || 0,
      mid: item.price_mid || 0,
      high: item.price_high || 0,
    },
    added_date: item.created_at,
    confidence: item.confidence,
  });

  const handleItemSelect = (item: CollectionItem) => {
    // Find the full item from database
    const fullItem = items.find(i => i.id === item.id);
    if (fullItem) {
      const analysisData: AnalysisData & { images: string[] } = {
        category: fullItem.category,
        subcategory: fullItem.subcategory || '',
        title: fullItem.title,
        maker_brand: fullItem.maker_brand || '',
        year_or_period: fullItem.year_or_period || '',
        set_or_model: fullItem.set_or_model || '',
        identifiers: fullItem.identifiers,
        condition: {
          grade: fullItem.condition_grade,
          notes: fullItem.condition_notes || ''
        },
        authenticity_flags: fullItem.authenticity_flags,
        price_estimate_SEK: {
          low: fullItem.price_low || 0,
          mid: fullItem.price_mid || 0,
          high: fullItem.price_high || 0,
          sources: ['database']
        },
        next_shots: [],
        confidence: fullItem.confidence,
        images: fullItem.images
      };
      setCurrentScanResult(analysisData);
      setView('result');
    }
  };

  const handleItemDelete = async (id: string) => {
    await deleteItem(id);
  };

  const handleExport = async () => {
    if (!user) return;
    
    try {
      const blob = await exportService.exportCollection(
        items, 
        user.email || 'user@example.com',
        {
          format: 'pdf',
          includeImages: false,
          includeValuation: true,
          template: 'standard'
        }
      );
      
      const filename = exportService.generateFilename('pdf', user.email || 'user');
      exportService.downloadFile(blob, filename);
      
      toast({
        title: 'Export klar!',
        description: `Din samling har exporterats som ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export misslyckades',
        description: 'Ett fel uppstod vid export av samlingen.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = () => {
    toast({
      title: 'Delningslänk skapad',
      description: 'Länk till din samling har kopierats.',
    });
  };

  const handleSignOut = async () => {
    await signOut();
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
              <span className="text-xs">Samling ({items.length})</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Logga ut</span>
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
          items={items.map(convertToCollectionItem)}
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
              <span className="text-xs">Samling ({items.length})</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Logga ut</span>
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
        image={currentScanResult.images[0] || ''}
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
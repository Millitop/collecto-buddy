import { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera as CameraIcon, Zap, Plus, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { onDeviceClassifier } from '@/lib/onDeviceML';
import { ocrService } from '@/lib/ocrService';
import { conditionGradingService } from '@/lib/conditionGrading';

interface ScannedItem {
  id: string;
  image: string;
  category: string;
  title: string;
  confidence: number;
  price_estimate?: {
    low: number;
    mid: number;
    high: number;
  };
  detectedText?: string[];
  hasText?: boolean;
  conditionGrade?: string;
  conditionScore?: number;
}

interface MobileScannerProps {
  onItemScanned: (item: ScannedItem) => void;
  onBatchComplete: (items: ScannedItem[]) => void;
}

export const MobileScanner = ({ onItemScanned, onBatchComplete }: MobileScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<ScannedItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const scanCountRef = useRef(0);

  const performOnDeviceAnalysis = async (imageData: string): Promise<ScannedItem> => {
    try {
      // Start all analysis in parallel for maximum speed
      const [classification, ocrData, conditionAnalysis] = await Promise.all([
        onDeviceClassifier.classifyImage(imageData),
        ocrService.extractCollectibleText(imageData, 'unknown').catch(err => {
          console.warn('OCR failed, continuing without text:', err);
          return {
            identifiers: [],
            dates: [],
            signatures: [],
            numbers: [],
            brands: []
          };
        }),
        conditionGradingService.analyzeCondition(imageData, 'unknown').catch(err => {
          console.warn('Condition analysis failed:', err);
          return {
            grade: 'Unknown',
            score: 70,
            factors: { corners: 70, edges: 70, surface: 70, centering: 70 },
            defects: [],
            recommendations: []
          };
        })
      ]);
      
      // Combine OCR results for richer identification
      const allIdentifiers = [
        ...ocrData.identifiers,
        ...ocrData.numbers,
        ...ocrData.dates,
        ...ocrData.brands
      ].filter(Boolean).slice(0, 10); // Limit to top 10 most relevant

      // Enhanced title with more context
      let enhancedTitle = `${classification.category === 'cards' ? 'Identifierat kort' : 
              classification.category === 'porcelain' ? 'Porslinsobjekt' :
              classification.category === 'coin' ? 'Mynt/medalj' :
              classification.category === 'stamp' ? 'Frimärke' :
              classification.category === 'toy' ? 'Leksak/figur' :
              'Samlarobjekt'}`;
      
      if (ocrData.brands.length > 0) {
        enhancedTitle += ` - ${ocrData.brands[0]}`;
      }
      
      if (ocrData.dates.length > 0) {
        enhancedTitle += ` (${ocrData.dates[0]})`;
      }

      const mockItem: ScannedItem = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        image: imageData,
        category: classification.category,
        title: enhancedTitle,
        confidence: Math.min(classification.confidence * 0.9, 0.9), // Slightly lower for quick scan
        price_estimate: {
          // Price influenced by condition
          low: Math.floor((Math.random() * 1000 + 100) * (conditionAnalysis.score / 100)),
          mid: Math.floor((Math.random() * 2000 + 500) * (conditionAnalysis.score / 100)),
          high: Math.floor((Math.random() * 5000 + 1000) * (conditionAnalysis.score / 100)),
        },
        detectedText: allIdentifiers,
        hasText: ocrData.identifiers.length > 0 || ocrData.numbers.length > 0,
        conditionGrade: conditionAnalysis.grade,
        conditionScore: conditionAnalysis.score
      };

      return mockItem;
    } catch (error) {
      console.error('On-device analysis failed:', error);
      
      // Fallback to simple random classification
      const categories = ['cards', 'porcelain', 'coin', 'stamp', 'toy'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      return {
        id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        image: imageData,
        category: randomCategory,
        title: `Identifierat ${randomCategory === 'cards' ? 'kort' : 'objekt'}`,
        confidence: 0.6,
        price_estimate: {
          low: Math.floor(Math.random() * 1000) + 100,
          mid: Math.floor(Math.random() * 2000) + 500,
          high: Math.floor(Math.random() * 5000) + 1000,
        },
        detectedText: [],
        hasText: false
      };
    }
  };

  // Simple file input fallback
  const handleFileInput = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Kunde inte läsa filen'));
          reader.readAsDataURL(file);
        } else {
          reject(new Error('Ingen fil vald'));
        }
      };
      
      input.click();
    });
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      
      // Try haptics on native platforms
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }

      let imageDataUrl: string | undefined;

      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Camera on native platforms
        console.log('Using native Capacitor Camera');
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        imageDataUrl = image.dataUrl;
      } else {
        // Use file input for web browsers  
        console.log('Using file input for web');
        imageDataUrl = await handleFileInput();
      }

      if (imageDataUrl) {
        setPreviewImage(imageDataUrl);
        
        // Perform quick on-device analysis
        const scannedItem = await performOnDeviceAnalysis(imageDataUrl);
        
        if (batchMode) {
          setBatchItems(prev => [...prev, scannedItem]);
          scanCountRef.current += 1;
          
          if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Medium });
          }
          toast({
            title: `Objekt ${scanCountRef.current} skannat`,
            description: `${scannedItem.title} - ${Math.round(scannedItem.confidence * 100)}% säker`,
          });
        } else {
          onItemScanned(scannedItem);
          if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
          }
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      
      let errorMessage = "Kunde inte öppna kameran.";
      if (error instanceof Error) {
        if (error.message.includes('Permission')) {
          errorMessage = "Kamerabehörighet nekad. Aktivera kamera i webbläsarinställningar.";
        } else if (error.message.includes('NotFound')) {
          errorMessage = "Ingen kamera hittades på enheten.";
        } else if (error.message.includes('NotSupported')) {
          errorMessage = "Kamera stöds inte i denna webbläsare.";
        }
      }
      
      toast({
        title: "Kamerafel",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setPreviewImage(null);
    }
  };

  const completeBatch = async () => {
    if (batchItems.length > 0) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      onBatchComplete(batchItems);
      setBatchItems([]);
      setBatchMode(false);
      scanCountRef.current = 0;
      
      toast({
        title: "Batch-skanning klar",
        description: `${batchItems.length} objekt redo för analys`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-hero text-white">
        <h1 className="text-xl font-bold">CollectorAI</h1>
        <div className="flex gap-2">
          <Button
            variant={batchMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setBatchMode(!batchMode);
              if (!batchMode) {
                setBatchItems([]);
                scanCountRef.current = 0;
              }
            }}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Layers className="w-4 h-4 mr-1" />
            {batchMode ? 'Batch PÅ' : 'Batch AV'}
          </Button>
        </div>
      </div>

      {/* Preview/Camera Area */}
      <div className="flex-1 relative bg-muted/20">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <CameraIcon className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-center px-4">
              {batchMode 
                ? "Batch-läge aktivt - skanna flera objekt i rad" 
                : "Rikta kameran mot ditt samlarobjekt"
              }
            </p>
            {batchMode && batchItems.length > 0 && (
              <Badge className="mt-2 bg-accent text-white">
                {batchItems.length} objekt skannade
              </Badge>
            )}
          </div>
        )}

        {/* Overlay guides - would show intelligent guides in real app */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-white/50 rounded-lg">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Centrera objektet
            </div>
          </div>
        </div>
      </div>

      {/* Batch Items Display */}
      {batchMode && batchItems.length > 0 && (
        <div className="max-h-32 overflow-y-auto bg-muted/30 p-2">
          <div className="flex gap-2 pb-2">
            {batchItems.map((item, index) => (
              <Card key={item.id} className="flex-shrink-0 w-20">
                <CardContent className="p-2">
                  <img 
                    src={item.image} 
                    alt={`Scan ${index + 1}`}
                    className="w-full h-12 object-cover rounded"
                  />
                  <p className="text-xs text-center mt-1">#{index + 1}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 bg-background border-t">
        <div className="flex gap-3">
          <Button
            onClick={handleScan}
            disabled={isScanning}
            size="lg"
            className="flex-1 bg-gradient-hero hover:shadow-premium h-14 text-lg font-medium"
          >
            {isScanning ? (
              <div className="flex items-center">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Analyserar...
              </div>
            ) : (
              <>
                <CameraIcon className="w-6 h-6 mr-2" />
                {batchMode ? 'Skanna Nästa' : 'Skanna'}
              </>
            )}
          </Button>

          {batchMode && batchItems.length > 0 && (
            <Button
              onClick={completeBatch}
              size="lg"
              variant="secondary"
              className="h-14 px-6"
            >
              <Zap className="w-5 h-5 mr-1" />
              Klar ({batchItems.length})
            </Button>
          )}
        </div>

        {batchMode && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Svep för att skanna 20+ objekt snabbt
          </p>
        )}
      </div>
    </div>
  );
};
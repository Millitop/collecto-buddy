import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Info, Plus, X, ArrowLeft } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface SwipeableResultProps {
  data: {
    category: string;
    subcategory: string;
    title: string;
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
  };
  image: string;
  onSwipeUp: () => void; // Add to collection
  onSwipeRight: () => void; // View details
  onSwipeLeft: () => void; // Dismiss
  onBack: () => void;
}

export const SwipeableResult = ({ 
  data, 
  image, 
  onSwipeUp, 
  onSwipeRight, 
  onSwipeLeft, 
  onBack 
}: SwipeableResultProps) => {
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartX(touch.clientX);
    setCurrentY(0);
    setCurrentX(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    const deltaX = touch.clientX - startX;
    
    setCurrentY(deltaY);
    setCurrentX(deltaX);
  };

  const handleTouchEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    
    if (Math.abs(currentY) > Math.abs(currentX)) {
      // Vertical swipe
      if (currentY < -threshold) {
        // Swipe up - Add to collection
        await Haptics.impact({ style: ImpactStyle.Heavy });
        onSwipeUp();
      }
    } else {
      // Horizontal swipe
      if (currentX > threshold) {
        // Swipe right - View details
        await Haptics.impact({ style: ImpactStyle.Medium });
        onSwipeRight();
      } else if (currentX < -threshold) {
        // Swipe left - Dismiss
        await Haptics.impact({ style: ImpactStyle.Light });
        onSwipeLeft();
      }
    }

    setCurrentY(0);
    setCurrentX(0);
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'Mint': 'bg-success text-white',
      'NM': 'bg-success text-white', 
      'EX': 'bg-warning text-white',
      'VG': 'bg-secondary text-secondary-foreground',
      'G': 'bg-muted text-muted-foreground',
    };
    return gradeColors[grade] || 'bg-muted text-muted-foreground';
  };

  const getSwipeHint = () => {
    if (Math.abs(currentY) > Math.abs(currentX)) {
      if (currentY < -50) return "↑ Lägg till i samling";
    } else {
      if (currentX > 50) return "→ Visa detaljer";
      if (currentX < -50) return "← Kassera";
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-hero text-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Skanningsresultat</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Swipe Hint */}
      {isDragging && getSwipeHint() && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium">
          {getSwipeHint()}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={cardRef}
          className="p-4"
          style={{
            transform: `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.1}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image Card */}
          <Card className="mb-4 bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="relative">
                <img 
                  src={image} 
                  alt={data.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 bg-black/70 text-white"
                >
                  {Math.round(data.confidence * 100)}% säker
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          <Card className="bg-gradient-hero text-white shadow-premium mb-4">
            <CardHeader>
              <CardTitle className="text-xl">{data.title}</CardTitle>
              <p className="text-white/80">{data.category} • {data.subcategory}</p>
            </CardHeader>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Condition & Value */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-secondary" />
                  Skick & Värde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`mb-3 ${getGradeColor(data.condition.grade)}`}>
                  {data.condition.grade}
                </Badge>
                <p className="text-sm text-muted-foreground mb-4">{data.condition.notes}</p>
                
                <div className="bg-gradient-premium text-white p-3 rounded-lg">
                  <div className="text-lg font-bold">
                    {data.price_estimate_SEK.low.toLocaleString()} - {data.price_estimate_SEK.high.toLocaleString()} SEK
                  </div>
                  <div className="text-sm text-white/80">
                    Medel: {data.price_estimate_SEK.mid.toLocaleString()} SEK
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent" />
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tillverkare:</span>
                  <span className="font-medium">{data.maker_brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">År/Period:</span>
                  <span className="font-medium">{data.year_or_period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Set/Modell:</span>
                  <span className="font-medium">{data.set_or_model}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={onSwipeLeft}
              className="h-12 text-muted-foreground border-muted-foreground"
            >
              <X className="w-5 h-5 mr-1" />
              Kassera
            </Button>
            
            <Button
              onClick={onSwipeUp}
              className="h-12 bg-gradient-hero hover:shadow-premium"
            >
              <Plus className="w-5 h-5 mr-1" />
              Lägg till
            </Button>
            
            <Button
              variant="secondary"
              onClick={onSwipeRight}
              className="h-12"
            >
              <TrendingUp className="w-5 h-5 mr-1" />
              Detaljer
            </Button>
          </div>

          {/* Swipe Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Svep upp för att lägga till • Svep höger för detaljer • Svep vänster för att kassera</p>
          </div>
        </div>
      </div>
    </div>
  );
};
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, TrendingUp, Camera, AlertTriangle } from 'lucide-react';

interface AnalysisData {
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
}

interface AnalysisResultProps {
  data: AnalysisData;
  isLoading?: boolean;
}

export const AnalysisResult = ({ data, isLoading }: AnalysisResultProps) => {
  if (isLoading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyserar ditt samlarobjekt...</p>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header with Category */}
      <Card className="bg-gradient-hero text-white shadow-premium">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{data.title}</CardTitle>
              <p className="text-white/80">{data.category} • {data.subcategory}</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {Math.round(data.confidence * 100)}% säker
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Mobile Details Information */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-secondary" />
            Detaljer & Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-start py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Tillverkare/Märke:</span>
              <span className="font-medium text-right text-sm max-w-[60%]">{data.maker_brand}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">År/Period:</span>
              <span className="font-medium text-sm">{data.year_or_period}</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Set/Modell:</span>
              <span className="font-medium text-right text-sm max-w-[60%]">{data.set_or_model}</span>
            </div>
          </div>
          {data.identifiers.length > 0 && (
            <div className="pt-2">
              <span className="text-muted-foreground text-sm block mb-3">Identifierare:</span>
              <div className="flex flex-wrap gap-2">
                {data.identifiers.map((id, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-3 py-1">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Condition & Value */}
      <div className="space-y-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Skick</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-4 px-4 py-2 text-sm ${getGradeColor(data.condition.grade)}`}>
              {data.condition.grade}
            </Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.condition.notes}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-premium text-white shadow-premium">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <TrendingUp className="w-5 h-5" />
              Marknadsvärde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2">
                {Math.round(data.price_estimate_SEK.mid/1000)}k SEK
              </div>
              <div className="text-sm text-white/80">
                {Math.round(data.price_estimate_SEK.low/1000)}k - {Math.round(data.price_estimate_SEK.high/1000)}k SEK
              </div>
            </div>
            <p className="text-white/80 text-xs text-center">
              Källor: {data.price_estimate_SEK.sources.join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Authenticity Flags */}
      {data.authenticity_flags.length > 0 && (
        <Card className="bg-warning/5 border-warning/20 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Äkthetsflaggor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.authenticity_flags.map((flag, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-warning">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0"></div>
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent" />
            Föreslagna Bilder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.next_shots.map((shot, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                {shot}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
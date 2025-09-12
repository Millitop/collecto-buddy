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

      {/* Details Information */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            Detaljer & Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tillverkare/Märke:</span>
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
          {data.identifiers.length > 0 && (
            <div>
              <span className="text-muted-foreground">Identifierare:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {data.identifiers.map((id, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Condition & Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Skick</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`mb-3 ${getGradeColor(data.condition.grade)}`}>
              {data.condition.grade}
            </Badge>
            <p className="text-sm text-muted-foreground">{data.condition.notes}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-premium text-white shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              Marknadsvärde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {data.price_estimate_SEK.low.toLocaleString()} - {data.price_estimate_SEK.high.toLocaleString()} SEK
            </div>
            <div className="text-lg font-medium mb-2 text-white/90">
              Medel: {data.price_estimate_SEK.mid.toLocaleString()} SEK
            </div>
            <p className="text-white/80 text-sm">
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
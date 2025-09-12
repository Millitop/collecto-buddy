import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, TrendingUp, Camera, AlertTriangle } from 'lucide-react';

interface AnalysisData {
  category: {
    domain: string;
    subdomain: string;
    specific_set: string;
  };
  variant: {
    year?: string;
    set?: string;
    edition?: string;
    manufacturer?: string;
    artist?: string;
    model_number?: string;
    brand?: string;
  };
  condition: {
    grade: string;
    explanation: string;
  };
  market_value: {
    range_sek: string;
    source_field: string;
  };
  next_steps: string[];
  risks_flags: string[];
  detected_text?: string[];
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
              <CardTitle className="text-xl mb-2">{data.category.domain}</CardTitle>
              <p className="text-white/80">{data.category.subdomain} • {data.category.specific_set}</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {Math.round(data.confidence)}% säker
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Variant Information */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            Variant & Detaljer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.variant.year && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">År:</span>
              <span className="font-medium">{data.variant.year}</span>
            </div>
          )}
          {data.variant.set && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Set:</span>
              <span className="font-medium">{data.variant.set}</span>
            </div>
          )}
          {data.variant.manufacturer && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tillverkare:</span>
              <span className="font-medium">{data.variant.manufacturer}</span>
            </div>
          )}
          {data.variant.model_number && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modellnummer:</span>
              <span className="font-mono text-sm">{data.variant.model_number}</span>
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
            <p className="text-sm text-muted-foreground">{data.condition.explanation}</p>
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
            <div className="text-2xl font-bold mb-1">{data.market_value.range_sek}</div>
            <p className="text-white/80 text-sm">Källa: {data.market_value.source_field}</p>
          </CardContent>
        </Card>
      </div>

      {/* OCR Text */}
      {data.detected_text && data.detected_text.length > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Detekterad Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.detected_text.map((text, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2">
                  {text}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent" />
            Nästa Steg
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.next_steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                {step}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risks & Flags */}
      {data.risks_flags.length > 0 && (
        <Card className="bg-destructive/5 border-destructive/20 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Varningar & Risker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.risks_flags.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-destructive">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
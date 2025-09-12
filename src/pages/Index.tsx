import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CameraUpload } from '@/components/CameraUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Sparkles, Zap, Shield, Target } from 'lucide-react';
import heroImage from '@/assets/hero-collectibles.jpg';

const Index = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      setAnalysisData({
        category: {
          domain: "Kortspel",
          subdomain: "Pokémon",
          specific_set: "Base Set 1st Edition"
        },
        variant: {
          year: "1998",
          set: "Base Set",
          edition: "1st Edition", 
          manufacturer: "Wizards of the Coast",
          model_number: "4/102"
        },
        condition: {
          grade: "NM",
          explanation: "Mycket fint skick med minimal kantslitage. Inga större repor eller bucklor synliga."
        },
        market_value: {
          range_sek: "15 000 - 25 000 SEK",
          source_field: "Senaste auktioner eBay & PWCC"
        },
        next_steps: [
          "Ta en närbild av alla fyra hörn",
          "Fotografera baksidan i bättre ljus",
          "Överväg professionell gradering (PSA/BGS)"
        ],
        risks_flags: [
          "Kontrollera äkthet - populärt kort för förfalskningar",
          "Shadowless-variant värd betydligt mer än unlimited"
        ],
        detected_text: ["Charizard", "4/102", "©1995, 96, 98 Nintendo"],
        confidence: 87
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional collectibles analysis"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-white/20 text-white border-0 mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Driven Expertise
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Collector<span className="text-secondary">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Professionell AI-analys av samlarobjekt genom avancerad bildanalys och marknadsdata
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-white/20 text-white">Kortspel</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">Mynt & Frimärken</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">Porslin & Keramik</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">Leksaker & Figuriner</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Expertanalys på sekunder</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-card shadow-card hover:shadow-premium transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Exakt Identifiering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI-driven kategorisering och variantanalys med hög precision för tusentals objekt.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card hover:shadow-premium transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-premium rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Realtidsvärdering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Aktuell marknadsvärdering baserad på senaste försäljningar och auktionsdata.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card hover:shadow-premium transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Äkthetsanalys</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Avancerad detektion av förfalskningar, reproductioner och kvalitetsbedömning.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Analysera ditt samlarobjekt</h2>
              <p className="text-muted-foreground text-lg">
                Ladda upp bilder av ditt objekt för professionell AI-analys och värdering
              </p>
            </div>

            <CameraUpload 
              onImagesSelected={setSelectedImages}
              maxImages={6}
            />

            {selectedImages.length > 0 && (
              <div className="mt-8 text-center">
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="bg-gradient-hero hover:shadow-premium transition-all duration-300 px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {isAnalyzing ? 'Analyserar...' : 'Starta Analys'}
                </Button>
              </div>
            )}

            {(analysisData || isAnalyzing) && (
              <div className="mt-12">
                <AnalysisResult 
                  data={analysisData} 
                  isLoading={isAnalyzing}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

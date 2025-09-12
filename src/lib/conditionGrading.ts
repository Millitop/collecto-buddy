interface ConditionAnalysis {
  grade: string;
  score: number; // 0-100
  factors: {
    corners: number;
    edges: number;
    surface: number;
    centering: number;
  };
  defects: string[];
  recommendations: string[];
}

interface GradingCriteria {
  category: string;
  factors: string[];
  gradeThresholds: Record<string, number>;
}

class ConditionGradingService {
  private gradingCriteria: Record<string, GradingCriteria> = {
    cards: {
      category: 'cards',
      factors: ['corners', 'edges', 'surface', 'centering'],
      gradeThresholds: {
        'Mint': 95,
        'NM': 85,
        'EX': 70,
        'VG': 55,
        'G': 35,
        'P': 0
      }
    },
    porcelain: {
      category: 'porcelain',
      factors: ['chips', 'cracks', 'staining', 'glaze'],
      gradeThresholds: {
        'Perfect': 95,
        'Excellent': 85,
        'Very Good': 70,
        'Good': 55,
        'Fair': 35,
        'Poor': 0
      }
    },
    coin: {
      category: 'coin',
      factors: ['wear', 'luster', 'scratches', 'toning'],
      gradeThresholds: {
        'MS70': 98,
        'MS69': 95,
        'MS68': 90,
        'MS67': 85,
        'MS66': 80,
        'MS65': 75,
        'AU': 60,
        'XF': 45,
        'VF': 30,
        'F': 15,
        'G': 0
      }
    },
    stamp: {
      category: 'stamp',
      factors: ['perforations', 'centering', 'gum', 'cancellation'],
      gradeThresholds: {
        'Superb': 95,
        'XF': 85,
        'VF': 70,
        'F': 55,
        'VG': 40,
        'G': 20,
        'Poor': 0
      }
    }
  };

  // Mock condition analysis - in production would use computer vision
  async analyzeCondition(imageData: string, category: string): Promise<ConditionAnalysis> {
    const criteria = this.gradingCriteria[category] || this.gradingCriteria.cards;
    
    // Simulate analysis based on category
    const mockFactors = this.generateMockFactors(category);
    const overallScore = this.calculateOverallScore(mockFactors, category);
    const grade = this.determineGrade(overallScore, criteria);
    
    return {
      grade,
      score: overallScore,
      factors: mockFactors,
      defects: this.generateDefects(mockFactors, category),
      recommendations: this.generateRecommendations(mockFactors, category)
    };
  }

  private generateMockFactors(category: string): { corners: number; edges: number; surface: number; centering: number } {
    // Generate realistic condition scores based on category
    const baseScore = 70 + Math.random() * 25; // 70-95 range
    
    switch (category) {
      case 'cards':
        return {
          corners: Math.max(0, baseScore + (Math.random() - 0.5) * 20),
          edges: Math.max(0, baseScore + (Math.random() - 0.5) * 15),
          surface: Math.max(0, baseScore + (Math.random() - 0.5) * 10),
          centering: Math.max(0, baseScore + (Math.random() - 0.5) * 25)
        };
      
      case 'porcelain':
        return {
          corners: Math.max(0, baseScore + (Math.random() - 0.5) * 30), // chips
          edges: Math.max(0, baseScore + (Math.random() - 0.5) * 25), // cracks
          surface: Math.max(0, baseScore + (Math.random() - 0.5) * 20), // staining
          centering: Math.max(0, baseScore + (Math.random() - 0.5) * 15) // glaze quality
        };
      
      default:
        return {
          corners: Math.max(0, baseScore + (Math.random() - 0.5) * 20),
          edges: Math.max(0, baseScore + (Math.random() - 0.5) * 20),
          surface: Math.max(0, baseScore + (Math.random() - 0.5) * 20),
          centering: Math.max(0, baseScore + (Math.random() - 0.5) * 20)
        };
    }
  }

  private calculateOverallScore(factors: any, category: string): number {
    // Weighted scoring based on category importance
    const weights = this.getWeights(category);
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(factors).forEach(([factor, score]) => {
      const weight = weights[factor] || 1;
      totalScore += (score as number) * weight;
      totalWeight += weight;
    });
    
    return Math.round(totalScore / totalWeight);
  }

  private getWeights(category: string): Record<string, number> {
    switch (category) {
      case 'cards':
        return { corners: 1.2, edges: 1.0, surface: 1.3, centering: 0.8 };
      case 'porcelain':
        return { corners: 1.5, edges: 1.3, surface: 1.0, centering: 0.7 }; // chips/cracks most important
      case 'coin':
        return { corners: 1.1, edges: 1.2, surface: 1.4, centering: 0.8 }; // wear/luster most important
      default:
        return { corners: 1.0, edges: 1.0, surface: 1.0, centering: 1.0 };
    }
  }

  private determineGrade(score: number, criteria: GradingCriteria): string {
    for (const [grade, threshold] of Object.entries(criteria.gradeThresholds)) {
      if (score >= threshold) {
        return grade;
      }
    }
    return 'Poor';
  }

  private generateDefects(factors: any, category: string): string[] {
    const defects: string[] = [];
    
    switch (category) {
      case 'cards':
        if (factors.corners < 80) defects.push('Lätt hörnskada synlig');
        if (factors.edges < 75) defects.push('Minimalt kantslitage');
        if (factors.surface < 85) defects.push('Mycket lätta ytskador');
        if (factors.centering < 70) defects.push('Något off-center');
        break;
        
      case 'porcelain':
        if (factors.corners < 85) defects.push('Mycket små nagg på kanten');
        if (factors.edges < 80) defects.push('Hårfina sprickor i glasyr');
        if (factors.surface < 75) defects.push('Lätt missfärgning');
        break;
        
      case 'coin':
        if (factors.corners < 80) defects.push('Lätt slitage på höga punkter');
        if (factors.surface < 75) defects.push('Några mycket små märken');
        if (factors.centering < 70) defects.push('Något off-center prägling');
        break;
    }
    
    return defects;
  }

  private generateRecommendations(factors: any, category: string): string[] {
    const recommendations: string[] = [];
    
    if (category === 'cards') {
      recommendations.push('Ta närbilder av alla fyra hörn');
      recommendations.push('Fotografera i indirekt ljus för bästa resultat');
      if (factors.surface < 85) {
        recommendations.push('Kontrollera för tryckfel eller skador under förstoring');
      }
    }
    
    if (category === 'porcelain') {
      recommendations.push('Undersök undersidan för tillverkarmärken');
      recommendations.push('Kontrollera för hårsprickor med starkt ljus');
    }
    
    return recommendations;
  }

  // Get human-readable condition description
  getConditionDescription(analysis: ConditionAnalysis, category: string): string {
    const { grade, score, defects } = analysis;
    
    let description = `${grade} (${score}/100)`;
    
    if (defects.length === 0) {
      description += ' - Inga synliga defekter upptäckta';
    } else {
      description += ` - ${defects.join(', ')}`;
    }
    
    return description;
  }

  // Get grading explanation for category
  getGradingExplanation(category: string): string {
    const explanations = {
      cards: 'Bedömning baserad på hörn, kanter, yta och centrering enligt branschstandard.',
      porcelain: 'Bedömning av nagg, sprickor, missfärgning och glasyr enligt antikvitetsstandard.',
      coin: 'Bedömning enligt Sheldon-skalan baserat på slitage, glans och allmänt tillstånd.',
      stamp: 'Bedömning av perforering, centrering, gummering och eventuell stämpling.'
    };
    
    return explanations[category as keyof typeof explanations] || 'Allmän tillståndsbedömning.';
  }
}

// Singleton instance
export const conditionGradingService = new ConditionGradingService();
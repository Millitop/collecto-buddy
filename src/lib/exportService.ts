import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Item } from '@/types/database';

interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeImages: boolean;
  includeValuation: boolean;
  template: 'standard' | 'insurance' | 'inventory';
}

interface CollectionSummary {
  totalItems: number;
  totalValue: number;
  categories: Record<string, number>;
  averageCondition: string;
  highestValue: Item;
  oldestItem: Item;
}

class ExportService {
  
  async exportCollection(
    items: Item[], 
    userEmail: string, 
    options: ExportOptions
  ): Promise<Blob> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(items, userEmail, options);
      case 'csv':
        return this.exportToCSV(items);
      case 'excel':
        return this.exportToExcel(items);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private async exportToPDF(
    items: Item[], 
    userEmail: string, 
    options: ExportOptions
  ): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Generate collection summary
    const summary = this.generateSummary(items);

    // Header with branding
    pdf.setFillColor(45, 55, 72); // Dark blue
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CollectorAI', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Professionell Samlingsdokumentation', margin, 32);

    yPosition = 60;

    // User info and date
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(`Samlare: ${userEmail}`, margin, yPosition);
    pdf.text(`Exportdatum: ${new Date().toLocaleDateString('sv-SE')}`, pageWidth - 60, yPosition);
    yPosition += 15;

    // Collection Summary Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Samlingsöversikt', margin, yPosition);
    yPosition += 10;

    // Summary stats in a box
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    yPosition += 8;
    
    pdf.text(`Antal objekt: ${summary.totalItems}`, margin + 5, yPosition);
    pdf.text(`Totalt värde: ${summary.totalValue.toLocaleString()} SEK`, pageWidth / 2, yPosition);
    yPosition += 6;
    
    pdf.text(`Kategorier: ${Object.keys(summary.categories).length}`, margin + 5, yPosition);
    pdf.text(`Genomsnittligt skick: ${summary.averageCondition}`, pageWidth / 2, yPosition);
    yPosition += 6;
    
    pdf.text(`Högsta värde: ${summary.highestValue?.title || 'N/A'}`, margin + 5, yPosition);
    pdf.text(`${(summary.highestValue?.price_mid || 0).toLocaleString()} SEK`, pageWidth / 2, yPosition);
    
    yPosition += 25;

    // Category breakdown
    if (Object.keys(summary.categories).length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Kategorier', margin, yPosition);
      yPosition += 8;

      Object.entries(summary.categories).forEach(([category, count]) => {
        const categoryItems = items.filter(item => item.category === category);
        const categoryValue = categoryItems.reduce((sum, item) => sum + (item.price_mid || 0), 0);
        
        pdf.setFontSize(10);
        pdf.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} objekt (${categoryValue.toLocaleString()} SEK)`, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
    }

    // Items section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detaljerad Inventering', margin, yPosition);
    yPosition += 15;

    // Items list
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      // Item box
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 35);
      
      // Item details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${i + 1}. ${item.title}`, margin + 5, yPosition + 3);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      // Row 1: Category and condition
      pdf.text(`Kategori: ${item.category}`, margin + 5, yPosition + 10);
      pdf.text(`Skick: ${item.condition_grade}`, pageWidth / 2, yPosition + 10);
      
      // Row 2: Details
      if (item.maker_brand) {
        pdf.text(`Tillverkare: ${item.maker_brand}`, margin + 5, yPosition + 16);
      }
      if (item.year_or_period) {
        pdf.text(`År: ${item.year_or_period}`, pageWidth / 2, yPosition + 16);
      }
      
      // Row 3: Value
      if (options.includeValuation && item.price_mid) {
        pdf.text(`Uppskattat värde: ${item.price_low?.toLocaleString()}-${item.price_high?.toLocaleString()} SEK`, margin + 5, yPosition + 22);
        pdf.text(`Medel: ${item.price_mid.toLocaleString()} SEK`, pageWidth / 2, yPosition + 22);
      }
      
      // Row 4: Added date
      pdf.text(`Tillagt: ${new Date(item.created_at).toLocaleDateString('sv-SE')}`, margin + 5, yPosition + 28);
      
      yPosition += 45;
    }

    // Footer
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Sida ${i} av ${pageCount}`, pageWidth - 30, pageHeight - 10);
      pdf.text('Genererad av CollectorAI - Professionell samlingsdokumentation', margin, pageHeight - 10);
    }

    return new Promise((resolve) => {
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
    });
  }

  private exportToCSV(items: Item[]): Blob {
    const headers = [
      'ID',
      'Titel',
      'Kategori',
      'Underkategori',
      'Tillverkare',
      'År/Period',
      'Set/Modell',
      'Skick',
      'Skick Noter',
      'Lågt Pris',
      'Medelpris',
      'Högt Pris',
      'Identifierare',
      'Autenticitetsflaggor',
      'Tillagt Datum'
    ];

    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.id,
        `"${item.title}"`,
        item.category,
        item.subcategory || '',
        item.maker_brand || '',
        item.year_or_period || '',
        item.set_or_model || '',
        item.condition_grade,
        `"${item.condition_notes || ''}"`,
        item.price_low || '',
        item.price_mid || '',
        item.price_high || '',
        `"${item.identifiers.join('; ')}"`,
        `"${item.authenticity_flags.join('; ')}"`,
        new Date(item.created_at).toLocaleDateString('sv-SE')
      ].join(','))
    ].join('\n');

    return new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private exportToExcel(items: Item[]): Blob {
    // For now, return CSV with Excel MIME type
    // In production, would use a proper Excel library like SheetJS
    const csvBlob = this.exportToCSV(items);
    return new Blob([csvBlob], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private generateSummary(items: Item[]): CollectionSummary {
    const totalValue = items.reduce((sum, item) => sum + (item.price_mid || 0), 0);
    
    const categories: Record<string, number> = {};
    items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    const grades = items.map(item => item.condition_grade);
    const averageCondition = this.calculateAverageCondition(grades);

    const highestValue = items.reduce((highest, item) => 
      (item.price_mid || 0) > (highest?.price_mid || 0) ? item : highest
    );

    const oldestItem = items.reduce((oldest, item) => 
      new Date(item.created_at) < new Date(oldest?.created_at || Date.now()) ? item : oldest
    );

    return {
      totalItems: items.length,
      totalValue,
      categories,
      averageCondition,
      highestValue,
      oldestItem
    };
  }

  private calculateAverageCondition(grades: string[]): string {
    const gradeValues: Record<string, number> = {
      'Mint': 100,
      'NM': 85,
      'EX': 70,
      'VG': 55,
      'G': 35,
      'P': 15
    };

    const avgValue = grades.reduce((sum, grade) => sum + (gradeValues[grade] || 50), 0) / grades.length;
    
    if (avgValue >= 95) return 'Mint';
    if (avgValue >= 80) return 'Near Mint';
    if (avgValue >= 65) return 'Excellent';
    if (avgValue >= 50) return 'Very Good';
    if (avgValue >= 30) return 'Good';
    return 'Poor';
  }

  // Download helper
  downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate appropriate filename
  generateFilename(format: string, userEmail: string): string {
    const date = new Date().toISOString().split('T')[0];
    const username = userEmail.split('@')[0];
    return `CollectorAI_${username}_${date}.${format}`;
  }
}

// Singleton instance
export const exportService = new ExportService();
import { createWorker, PSM } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

class OCRService {
  private worker: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing OCR worker...');
      
      this.worker = await createWorker('eng+swe', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      
      // Optimize for collectibles text detection
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÅÄÖåäö©®™/-.,()[]{}:; ',
        tessedit_pageseg_mode: PSM.SPARSE_TEXT, // Good for scattered text on collectibles
      });
      
      this.isInitialized = true;
      console.log('OCR service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR:', error);
      throw error;
    }
  }

  async extractText(imageData: string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Starting OCR text extraction...');
      
      const { data } = await this.worker.recognize(imageData);
      
      // Filter out low-confidence results and very short text
      const filteredWords = data.words
        .filter((word: any) => word.confidence > 30 && word.text.trim().length > 1)
        .map((word: any) => ({
          text: word.text.trim(),
          confidence: word.confidence,
          bbox: word.bbox,
        }));

      const result: OCRResult = {
        text: data.text.trim(),
        confidence: data.confidence,
        words: filteredWords,
      };

      console.log(`OCR completed. Found ${filteredWords.length} words with confidence ${Math.round(data.confidence)}%`);
      return result;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw error;
    }
  }

  // Specialized text extraction for different collectible types
  async extractCollectibleText(imageData: string, category: string): Promise<{
    identifiers: string[];
    dates: string[];
    signatures: string[];
    numbers: string[];
    brands: string[];
  }> {
    const ocrResult = await this.extractText(imageData);
    
    const identifiers: string[] = [];
    const dates: string[] = [];
    const signatures: string[] = [];
    const numbers: string[] = [];
    const brands: string[] = [];

    for (const word of ocrResult.words) {
      const text = word.text.toUpperCase();
      
      // Extract years (1800-2030)
      const yearMatch = text.match(/\b(18|19|20)\d{2}\b/);
      if (yearMatch) {
        dates.push(yearMatch[0]);
      }
      
      // Extract model numbers and card numbers
      const numberMatch = text.match(/\b\d+[A-Z]?\b|\b[A-Z]+\d+\b/);
      if (numberMatch) {
        numbers.push(text);
      }
      
      // Category-specific extraction
      switch (category) {
        case 'cards':
          // Pokemon/MTG card specific patterns
          if (text.match(/\b\d+\/\d+\b/)) { // Card numbers like 4/102
            identifiers.push(text);
          }
          if (text.includes('©') || text.includes('®') || text.includes('™')) {
            identifiers.push(text);
          }
          if (text.match(/\b(1ST|FIRST|EDITION|SHADOWLESS|UNLIMITED)\b/)) {
            identifiers.push(text);
          }
          break;
          
        case 'porcelain':
          // Porcelain maker marks and patterns
          if (text.match(/\b(RÖRSTRAND|GUSTAVSBERG|ROYAL|COPENHAGEN|WEDGWOOD|SPODE)\b/)) {
            brands.push(text);
          }
          if (text.match(/\b[A-Z]{2,}\s?\d+\b/)) { // Pattern numbers
            identifiers.push(text);
          }
          break;
          
        case 'coin':
          // Coin specific text
          if (text.match(/\b(SVERIGE|SWEDEN|KRONOR|ÖRE|RIKSBANK)\b/)) {
            identifiers.push(text);
          }
          if (text.match(/\b\d+\s?(KR|ÖRE|KRONOR)\b/)) {
            identifiers.push(text);
          }
          break;
          
        case 'stamp':
          // Stamp specific patterns
          if (text.match(/\b(SVERIGE|SWEDEN|POST|POSTAGE)\b/)) {
            identifiers.push(text);
          }
          if (text.match(/\b\d+\s?(ÖRE|KR)\b/)) {
            identifiers.push(text);
          }
          break;
      }
      
      // Potential signatures (cursive-like text)
      if (word.confidence < 70 && text.length > 3 && text.match(/[A-Za-z]/)) {
        signatures.push(text);
      }
    }

    return {
      identifiers: [...new Set(identifiers)], // Remove duplicates
      dates: [...new Set(dates)],
      signatures: [...new Set(signatures)],
      numbers: [...new Set(numbers)],
      brands: [...new Set(brands)],
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR worker terminated');
    }
  }
}

// Singleton instance
export const ocrService = new OCRService();
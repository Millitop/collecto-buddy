import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser usage
env.allowLocalModels = false;
env.useBrowserCache = true;

interface ClassificationResult {
  category: string;
  confidence: number;
  subcategory?: string;
}

class OnDeviceClassifier {
  private classifier: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing on-device classifier...');
      
      // Use a lightweight image classification model for quick pre-categorization
      this.classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'webgpu' }
      );
      
      this.isInitialized = true;
      console.log('On-device classifier initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      
      try {
        this.classifier = await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k'
        );
        this.isInitialized = true;
        console.log('On-device classifier initialized on CPU');
      } catch (cpuError) {
        console.error('Failed to initialize classifier:', cpuError);
        throw cpuError;
      }
    }
  }

  async classifyImage(imageData: string): Promise<ClassificationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const results = await this.classifier(imageData);
      
      if (!results || results.length === 0) {
        return this.getFallbackClassification();
      }

      // Map ImageNet labels to collectible categories
      const topResult = results[0];
      const mappedCategory = this.mapToCollectibleCategory(topResult.label);
      
      return {
        category: mappedCategory.category,
        subcategory: mappedCategory.subcategory,
        confidence: Math.min(topResult.score * 0.8, 0.9), // Scale down confidence for pre-classification
      };
    } catch (error) {
      console.error('Classification error:', error);
      return this.getFallbackClassification();
    }
  }

  private mapToCollectibleCategory(label: string): { category: string; subcategory?: string } {
    const labelLower = label.toLowerCase();
    
    // Map common ImageNet labels to collectible categories
    const categoryMappings: Record<string, { category: string; subcategory?: string }> = {
      // Cards/paper items
      'envelope': { category: 'cards', subcategory: 'Trading Cards' },
      'book jacket': { category: 'cards', subcategory: 'Trading Cards' },
      'comic book': { category: 'comic', subcategory: 'Comic Books' },
      
      // Toys and figures
      'teddy': { category: 'toy', subcategory: 'Stuffed Animals' },
      'doll': { category: 'toy', subcategory: 'Dolls & Figures' },
      'toy terrier': { category: 'toy', subcategory: 'Toy Animals' },
      'toyshop': { category: 'toy', subcategory: 'Various Toys' },
      
      // Coins and metal objects
      'coin': { category: 'coin', subcategory: 'Coins' },
      'brass': { category: 'coin', subcategory: 'Metal Objects' },
      'buckle': { category: 'coin', subcategory: 'Metal Collectibles' },
      
      // Porcelain and ceramics
      'vase': { category: 'porcelain', subcategory: 'Vases' },
      'pitcher': { category: 'porcelain', subcategory: 'Vessels' },
      'teapot': { category: 'porcelain', subcategory: 'Tea Sets' },
      'cup': { category: 'porcelain', subcategory: 'Cups & Saucers' },
      'bowl': { category: 'porcelain', subcategory: 'Bowls' },
      'plate': { category: 'porcelain', subcategory: 'Plates' },
      'pottery': { category: 'porcelain', subcategory: 'Pottery' },
      
      // Stamps
      'mailbag': { category: 'stamp', subcategory: 'Postal Collectibles' },
      
      // Electronics/retro items
      'radio': { category: 'retro_electronics', subcategory: 'Audio Equipment' },
      'television': { category: 'retro_electronics', subcategory: 'Video Equipment' },
      'cassette': { category: 'retro_electronics', subcategory: 'Media' },
      
      // Default mappings for common objects
      'plastic bag': { category: 'cards', subcategory: 'Packaged Items' },
      'carton': { category: 'cards', subcategory: 'Boxed Items' },
    };

    // Check for direct matches
    for (const [key, value] of Object.entries(categoryMappings)) {
      if (labelLower.includes(key)) {
        return value;
      }
    }

    // Fallback based on common patterns
    if (labelLower.includes('toy') || labelLower.includes('doll') || labelLower.includes('teddy')) {
      return { category: 'toy', subcategory: 'Collectible Toys' };
    }
    
    if (labelLower.includes('ceramic') || labelLower.includes('porcelain') || labelLower.includes('china')) {
      return { category: 'porcelain', subcategory: 'Ceramics' };
    }
    
    if (labelLower.includes('metal') || labelLower.includes('brass') || labelLower.includes('silver')) {
      return { category: 'coin', subcategory: 'Metal Items' };
    }

    // Default to cards for paper-like or unknown items
    return { category: 'cards', subcategory: 'Collectible Items' };
  }

  private getFallbackClassification(): ClassificationResult {
    const categories = ['cards', 'porcelain', 'coin', 'stamp', 'toy'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    return {
      category: randomCategory,
      confidence: 0.6, // Low confidence for fallback
      subcategory: 'General Collectible'
    };
  }

  async extractText(imageData: string): Promise<string[]> {
    // Placeholder for OCR functionality
    // In a real implementation, this would use ML Kit or Tesseract.js
    console.log('OCR extraction not yet implemented');
    return [];
  }

  async detectBarcodes(imageData: string): Promise<string[]> {
    // Placeholder for barcode detection
    // In a real implementation, this would use ML Kit or ZXing
    console.log('Barcode detection not yet implemented');
    return [];
  }
}

// Singleton instance
export const onDeviceClassifier = new OnDeviceClassifier();
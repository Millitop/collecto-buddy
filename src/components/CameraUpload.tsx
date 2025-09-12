import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CameraUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
}

export const CameraUpload = ({ onImagesSelected, maxImages = 6 }: CameraUploadProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxImages - selectedImages.length);
    const updatedImages = [...selectedImages, ...newFiles];
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 bg-gradient-card",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "hover:border-primary/50 hover:shadow-soft"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-hero flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ladda upp bilder av ditt samlarobjekt</h3>
          <p className="text-muted-foreground mb-6">
            Dra och släpp bilder här, eller använd kameran/filväljaren nedan
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="default" 
              onClick={() => cameraInputRef.current?.click()}
              className="bg-gradient-hero hover:shadow-soft transition-all"
            >
              <Camera className="w-4 h-4 mr-2" />
              Ta foto
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-primary/5 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Välj filer
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Upp till {maxImages} bilder • JPG, PNG, WEBP
          </p>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {selectedImages.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-card">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <div className="absolute bottom-2 left-2 bg-success rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Image, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogoUploaderProps {
  value?: string;
  onChange: (filename: string) => void;
  label?: string;
}

export function LogoUploader({ value, onChange, label = "Logo" }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChange(result.filename);
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        const response = await fetch(`/api/upload/logo/${value}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Logo deleted successfully",
          });
        } else {
          // Even if delete fails, still remove from form since file might not exist
          console.warn('Failed to delete file from server, but removing from form');
        }
      } catch (error) {
        console.error('Error deleting logo:', error);
        // Even if delete fails, still remove from form
      }
    }

    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
          
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading ? "Uploading..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Logo</Label>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
              <img
                src={value.startsWith('/assets/') ? value : `/assets/${value}`}
                alt="Logo preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden flex items-center justify-center w-full h-full">
                <Image className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium">Logo Preview</p>
              <p className="text-xs text-muted-foreground">
                {value}
              </p>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
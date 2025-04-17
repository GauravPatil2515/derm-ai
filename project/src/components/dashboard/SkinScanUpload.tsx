import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useService } from '../../lib/ServiceContext';

interface SkinScanUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export function SkinScanUpload({ onUpload }: SkinScanUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isHealthy } = useService();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG or PNG)');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size should be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!isHealthy) {
      setError('Service is currently unavailable. Please try again later.');
      return;
    }

    setError(null);
    
    if (!validateFile(file)) {
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setSelectedFile(file);
    } catch (err) {
      setError('Error processing image. Please try again.');
      console.error('Error processing file:', err);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(selectedFile);
      
      // Reset form after successful upload
      setSelectedFile(null);
      setPreview(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!isHealthy && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-4">
          <p className="text-yellow-800">
            Service is currently unavailable. Please try again later.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-pink-400 bg-pink-50'
            : isUploading
            ? 'border-pink-300 bg-pink-50'
            : 'border-pink-200 hover:border-pink-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept="image/png, image/jpeg"
          disabled={!isHealthy || isUploading}
        />

        {preview ? (
          <div className="relative w-full p-4">
            {!isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute right-6 top-6 z-10 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[300px] rounded-lg object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Upload className="mb-4 h-8 w-8 text-pink-400" />
            <p className="mb-2 text-sm text-pink-600">
              {isUploading 
                ? 'Uploading and analyzing your image...'
                : 'Drag and drop your image here, or click to select'
              }
            </p>
            <p className="text-xs text-pink-400">Supports: JPEG, PNG (max 10MB)</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-pink-600">Analyzing image...</p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!isHealthy || isUploading}
            className="rounded-lg bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Analyze Image
          </button>
        </div>
      )}
    </div>
  );
}
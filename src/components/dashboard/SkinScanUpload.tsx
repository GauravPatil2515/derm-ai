import { useState, useRef } from 'react';
import { Upload, X, Image, FileImage } from 'lucide-react';
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
    const maxSize = 10 * 1024 * 1024;

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

      setSelectedFile(null);
      setPreview(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image. Please try again.';
      setError(errorMessage);
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
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div
        className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${dragActive
            ? 'border-primary-400 bg-primary-50/50'
            : isUploading
              ? 'border-primary-300 bg-primary-50/30'
              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50/50'
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
          <div className="relative w-full p-6">
            {!isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute right-8 top-8 z-10 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-900 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[280px] rounded-lg object-contain shadow-md"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-6">
              <Upload className="w-7 h-7 text-primary-500" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isUploading ? 'Processing...' : 'Drop your image here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse from your device
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileImage className="w-4 h-4" />
                JPEG, PNG
              </span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-primary-100" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-600">Analyzing...</p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Image className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isHealthy || isUploading}
            className="btn-premium"
          >
            Analyze Image
          </button>
        </div>
      )}
    </div>
  );
}
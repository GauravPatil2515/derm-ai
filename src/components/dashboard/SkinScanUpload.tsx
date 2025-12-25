import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
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
      setError('Please upload a JPEG or PNG image');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be under 10MB');
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!isHealthy) {
      setError('Service unavailable. Please try again.');
      return;
    }

    setError(null);
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <div
        className={`relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${dragActive
            ? 'border-pink-400 bg-pink-50'
            : 'border-pink-200 hover:border-pink-300 bg-pink-50/30'
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
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="absolute right-6 top-6 z-10 p-1.5 rounded-full bg-gray-900/80 text-white hover:bg-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[240px] rounded-lg object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-pink-400" />
            </div>
            <p className="font-medium text-pink-800 mb-1">
              Drop your image here
            </p>
            <p className="text-sm text-pink-600 mb-3">
              or click to browse
            </p>
            <p className="text-xs text-pink-400">
              JPEG, PNG • Max 10MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
              <Image className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-pink-800 truncate max-w-[180px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-pink-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button onClick={handleSubmit} className="btn-primary">
            Analyze Image
          </button>
        </div>
      )}
    </div>
  );
}
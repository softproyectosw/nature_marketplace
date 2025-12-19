'use client';

import { useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'nature_access_token';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadSuccess?: (newUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export function PhotoUpload({ currentPhotoUrl, onUploadSuccess, onUploadError }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Tipo de archivo no válido. Usa JPEG, PNG, GIF o WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('El archivo es muy grande. Máximo 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    console.log('[PhotoUpload] Starting upload for file:', file.name, file.type, file.size);
    
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      console.log('[PhotoUpload] Token:', token ? 'exists' : 'missing');
      if (!token) {
        onUploadError?.('Debes iniciar sesión para subir una foto');
        return;
      }

      const formData = new FormData();
      formData.append('photo', file);

      console.log('[PhotoUpload] Sending request to:', `${API_URL}/api/users/profile/photo/`);
      const response = await fetch(`${API_URL}/api/users/profile/photo/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('[PhotoUpload] Response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.error('[PhotoUpload] Error response:', data);
        throw new Error(data.photo?.[0] || data.detail || 'Error al subir la foto');
      }

      const data = await response.json();
      console.log('[PhotoUpload] Success response:', data);
      console.log('[PhotoUpload] avatar_url received:', data.avatar_url);
      console.log('[PhotoUpload] photo_url received:', data.photo_url);
      onUploadSuccess?.(data.avatar_url);
      setPreviewUrl(null);
    } catch (error) {
      console.error('[PhotoUpload] Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Error al subir la foto');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    setIsUploading(true);
    
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        onUploadError?.('Debes iniciar sesión');
        return;
      }

      const response = await fetch(`${API_URL}/api/users/profile/photo/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la foto');
      }

      onUploadSuccess?.('');
      setPreviewUrl(null);
    } catch (error) {
      console.error('Delete error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Error al eliminar la foto');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;
  console.log('[PhotoUpload] Rendering with displayUrl:', displayUrl);
  console.log('[PhotoUpload] currentPhotoUrl prop:', currentPhotoUrl);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full bg-cover bg-center bg-primary/20 flex items-center justify-center border-2 border-primary/30"
          style={displayUrl ? { backgroundImage: `url("${displayUrl}")` } : undefined}
        >
          {!displayUrl && (
            <span className="material-symbols-outlined text-4xl text-primary">person</span>
          )}
        </div>
        
        {/* Upload overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-white">photo_camera</span>
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Subiendo...' : 'Cambiar foto'}
        </button>
        
        {currentPhotoUrl && (
          <button
            onClick={handleDeletePhoto}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-white/50 text-center">
        JPEG, PNG, GIF o WebP. Máximo 5MB.
      </p>
    </div>
  );
}

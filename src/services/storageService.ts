import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import imageCompression from 'browser-image-compression';

/**
 * Service for handling file uploads to Supabase Storage
 */
export const StorageService = {
  /**
   * Compresses and uploads a file to the 'photos' bucket as WebP
   * @param file The file to upload
   * @param path The path inside the bucket (e.g., 'barbers' or 'shops')
   * @returns The public URL of the uploaded file
   */
  uploadImage: async (file: File, path: 'barbers' | 'shops'): Promise<string> => {
    try {
      // 1. Compress and convert the image to WebP
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      const compressedFile = await imageCompression(file, options);

      // 2. Generate a unique filename with .webp extension
      const fileName = `${uuidv4()}.webp`;
      const filePath = `${path}/${fileName}`;

      // 3. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp'
        });

      if (error) {
        throw error;
      }

      // 4. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  /**
   * Deletes an image from Supabase Storage
   * @param url The public URL of the image to delete
   */
  deleteImage: async (url: string): Promise<void> => {
    try {
      // Extract the path from the URL
      // Example URL: https://xyz.supabase.co/storage/v1/object/public/photos/barbers/uuid.webp
      const urlParts = url.split('/photos/');
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('photos')
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // We don't necessarily want to block the flow if deletion fails
    }
  }
};

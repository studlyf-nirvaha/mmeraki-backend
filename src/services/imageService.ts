import { uploadImage } from '../utils/supabase';

export interface ImageProcessingResult {
  success: boolean;
  url?: string;
  error?: string;
  originalUrl?: string;
}

export class ImageService {
  /**
   * Process and store images from various sources
   * Supports Google Drive links, direct web URLs, and base64 data
   */
  async processAndStoreImage(
    imageInput: string,
    experienceId: string,
    imageIndex: number = 0
  ): Promise<ImageProcessingResult> {
    try {
      let imageUrl: string;
      let imageBuffer: Buffer;

      // Check if it's a Google Drive link
      if (this.isGoogleDriveLink(imageInput)) {
        const processedUrl = this.convertDriveLinkToDirect(imageInput);
        imageUrl = processedUrl;
        imageBuffer = await this.downloadImageFromUrl(processedUrl);
      }
      // Check if it's a direct web URL
      else if (this.isValidUrl(imageInput)) {
        imageUrl = imageInput;
        imageBuffer = await this.downloadImageFromUrl(imageInput);
      }
      // Check if it's base64 data
      else if (this.isBase64Image(imageInput)) {
        imageBuffer = this.convertBase64ToBuffer(imageInput);
        imageUrl = imageInput; // Keep original base64 for now
      }
      else {
        return {
          success: false,
          error: 'Invalid image format. Please provide a valid URL or base64 data.',
          originalUrl: imageInput
        };
      }

      // Upload to Supabase Storage
      let fileName = `experience-${experienceId}-${imageIndex}-${Date.now()}.jpg`;
      
      // Determine file extension based on input type
      if (this.isBase64Image(imageInput)) {
        const mimeType = this.getMimeTypeFromBase64(imageInput);
        const extension = mimeType.split('/')[1] || 'jpg';
        fileName = `experience-${experienceId}-${imageIndex}-${Date.now()}.${extension}`;
      }
      
      const uploadedUrl = await uploadImage(imageBuffer, fileName, 'images');

      return {
        success: true,
        url: uploadedUrl,
        originalUrl: imageInput
      };

    } catch (error) {
      console.error('Error processing image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image',
        originalUrl: imageInput
      };
    }
  }

  /**
   * Process multiple images for an experience
   */
  async processMultipleImages(
    imageInputs: string[],
    experienceId: string
  ): Promise<ImageProcessingResult[]> {
    const results: ImageProcessingResult[] = [];
    
    for (let i = 0; i < imageInputs.length; i++) {
      const result = await this.processAndStoreImage(imageInputs[i], experienceId, i);
      results.push(result);
    }

    return results;
  }

  /**
   * Check if the input is a Google Drive link
   */
  private isGoogleDriveLink(url: string): boolean {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  }

  /**
   * Convert Google Drive sharing link to direct download link
   */
  private convertDriveLinkToDirect(driveUrl: string): string {
    try {
      // Handle different Google Drive link formats
      let fileId: string;

      // Format 1: https://drive.google.com/file/d/FILE_ID/view
      const match1 = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (match1) {
        fileId = match1[1];
      }
      // Format 2: https://drive.google.com/open?id=FILE_ID
      else {
        const match2 = driveUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (match2) {
          fileId = match2[1];
        } else {
          throw new Error('Invalid Google Drive link format');
        }
      }

      // Convert to direct download link with proper headers
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch (error) {
      throw new Error('Failed to convert Google Drive link: ' + error);
    }
  }

  /**
   * Check if the input is a valid URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the input is base64 image data
   */
  private isBase64Image(data: string): boolean {
    return data.startsWith('data:image/') && data.includes('base64,');
  }

  /**
   * Convert base64 string to Buffer
   */
  private convertBase64ToBuffer(base64String: string): Buffer {
    const base64Data = base64String.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Get MIME type from base64 data URL
   */
  private getMimeTypeFromBase64(base64String: string): string {
    const mimeMatch = base64String.match(/data:([^;]+);base64/);
    return mimeMatch ? mimeMatch[1] : 'image/png';
  }

  /**
   * Download image from URL and return as Buffer
   */
  private async downloadImageFromUrl(url: string): Promise<Buffer> {
    try {
      // Special handling for Google Drive links
      if (this.isGoogleDriveLink(url)) {
        return await this.downloadFromGoogleDrive(url);
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`Failed to download image from URL: ${error}`);
    }
  }

  /**
   * Special handling for Google Drive downloads
   */
  private async downloadFromGoogleDrive(driveUrl: string): Promise<Buffer> {
    try {
      // Extract file ID
      const fileId = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || 
                    driveUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/)?.[1];
      
      if (!fileId) {
        throw new Error('Could not extract file ID from Google Drive URL');
      }

      // Try multiple Google Drive download methods
      const downloadMethods = [
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
        `https://lh3.googleusercontent.com/d/${fileId}`,
        `https://docs.google.com/uc?export=download&id=${fileId}`
      ];

      for (const methodUrl of downloadMethods) {
        try {
          console.log(`Trying Google Drive method: ${methodUrl}`);
          
          const response = await fetch(methodUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Referer': 'https://drive.google.com/',
              'DNT': '1',
              'Connection': 'keep-alive'
            },
            redirect: 'follow',
            timeout: 10000 // 10 second timeout
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            console.log(`Response status: ${response.status}, Content-Type: ${contentType}`);
            
            // Check if it's actually an image
            if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              
              // Basic validation - check if it's not empty and has reasonable size
              if (buffer.length > 0 && buffer.length < 50 * 1024 * 1024) { // Max 50MB
                console.log(`Successfully downloaded from Google Drive: ${buffer.length} bytes`);
                return buffer;
              }
            }
            
            // If it's HTML, it might be a confirmation page
            if (contentType.includes('text/html')) {
              const html = await response.text();
              
              // Look for download links in the HTML
              const downloadMatches = [
                html.match(/href="([^"]*uc[^"]*export=download[^"]*)"/),
                html.match(/href="([^"]*export=download[^"]*)"/),
                html.match(/window\.open\('([^']*export=download[^']*)'\)/)
              ];
              
              for (const match of downloadMatches) {
                if (match && match[1]) {
                  const downloadUrl = match[1].startsWith('http') ? match[1] : `https://drive.google.com${match[1]}`;
                  console.log(`Found download link in HTML: ${downloadUrl}`);
                  
                  try {
                    const downloadResponse = await fetch(downloadUrl, {
                      headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                      }
                    });
                    
                    if (downloadResponse.ok) {
                      const downloadBuffer = Buffer.from(await downloadResponse.arrayBuffer());
                      if (downloadBuffer.length > 0) {
                        console.log(`Successfully downloaded via HTML link: ${downloadBuffer.length} bytes`);
                        return downloadBuffer;
                      }
                    }
                  } catch (downloadError) {
                    console.log(`Failed to download from HTML link: ${downloadError.message}`);
                  }
                }
              }
            }
          }
        } catch (methodError) {
          console.log(`Method failed: ${methodError.message}`);
          continue; // Try next method
        }
      }
      
      throw new Error('All Google Drive download methods failed. The file may not be publicly accessible or may require authentication.');
    } catch (error) {
      throw new Error(`Failed to download from Google Drive: ${error.message}`);
    }
  }

  /**
   * Validate image URL accessibility
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get image metadata (size, type, etc.)
   */
  async getImageMetadata(url: string): Promise<{ width?: number; height?: number; type?: string }> {
    try {
      const response = await fetch(url);
      if (!response.ok) return {};

      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Simple image type detection
      let type = 'unknown';
      if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) type = 'jpeg';
      else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) type = 'png';
      else if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49) type = 'gif';
      else if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49) type = 'webp';

      return { type };
    } catch {
      return {};
    }
  }
}

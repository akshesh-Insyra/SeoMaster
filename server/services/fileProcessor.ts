import sharp from "sharp";

export async function convertImage(buffer: Buffer, format: string): Promise<Buffer> {
  try {
    let sharpInstance = sharp(buffer);
    
    switch (format.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return await sharpInstance.jpeg({ quality: 90 }).toBuffer();
      case 'png':
        return await sharpInstance.png().toBuffer();
      case 'webp':
        return await sharpInstance.webp({ quality: 90 }).toBuffer();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error("Image conversion error:", error);
    throw new Error("Failed to convert image");
  }
}

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = "us-east-2";
const BUCKET_NAME = "reddit-docs";

const s3 = new S3Client({ 
  region: REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(s3Key: string, expiresInSeconds: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({ 
      Bucket: BUCKET_NAME, 
      Key: s3Key 
    });
    
    const url = await getSignedUrl(s3, command, { 
      expiresIn: expiresInSeconds 
    });
    
    return url;
  } catch (error) {
    console.error(`Error generating presigned URL for ${s3Key}:`, error);
    throw error;
  }
}

export async function generateMultiplePresignedUrls(s3Keys: string[]): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  
  await Promise.all(
    s3Keys.map(async (s3Key) => {
      try {
        const url = await generatePresignedUrl(s3Key);
        urls[s3Key] = url;
      } catch (error) {
        console.error(`Failed to generate URL for ${s3Key}:`, error);
        // Don't include failed URLs in the result
      }
    })
  );
  
  return urls;
}
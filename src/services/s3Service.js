import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../configs/s3Client.js";

class S3Service {
  constructor(bucketName) {
    this.bucketName = bucketName;
  }

  async uploadImage(fullPath, fileContent, contentType = "image/jpeg") {
    const params = {
      Bucket: this.bucketName,
      Key: `${fullPath}`,
      Body: fileContent,
      ContentType: contentType,
    };
    await s3Client.send(new PutObjectCommand(params));
    return this.getImageUrl(fullPath);
  }

  getImageUrl(fullPath) {
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullPath}`;
  }

  async deleteImage(fullPath) {
    const params = {
      Bucket: this.bucketName,
      Key: `${fullPath}`,
    };
    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  }
}

const s3Service = new S3Service(process.env.AWS_S3_BUCKET_NAME);

export default s3Service;
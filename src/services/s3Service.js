import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../../configs/s3Client.js";
import { getSharpInstance } from "../utils/image.js";
import UnknownError from '../infrastructure/errors/UnknownError.js';
import sharp from "sharp";


class S3Service {
  constructor(bucketName) {
    this.bucketName = bucketName;
  }
  changeBucketNameForTest() {
    this.bucketName = process.env.AWS_S3_TEST_ONLY_BUCKET_NAME
  }

  async uploadImage(fullPath, fileContent, contentType = "image/jpeg") {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `${fullPath}`,
        Body: fileContent,
        ContentType: contentType,
      };
      await s3Client.send(new PutObjectCommand(params));
      return this.getImageUrl(fullPath);
    } catch (error) {
      throw new UnknownError(error, "src/services/s3Service.js");
    }
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

  async processAndUploadImage(originalFullPath, previewFullPath) {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: originalFullPath,
    };
    const data = await s3Client.send(new GetObjectCommand(getObjectParams));
    if (!data?.Body || typeof data.Body.pipe !== 'function') {
      throw new UnknownError("Invalid S3 response body or not a stream in s3Service.processAndUploadImage()");
    }
    const processedStream = data.Body.pipe(getSharpInstance())
    const uploadParams = {
      Bucket: this.bucketName,
      Key: previewFullPath,
      Body: processedStream,
      ContentType: 'image/jpeg',
    };
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });
    await upload.done();
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${previewFullPath}`;
  }
}

const s3Service = new S3Service(process.env.AWS_S3_BUCKET_NAME);

export default s3Service;
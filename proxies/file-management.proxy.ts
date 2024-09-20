import { S3ObjectDto } from '@/models/s3-object-dto';
import axiosInstance from '@/utils/axiosInstance';
class FileManagementProxy {
  //#region
  async UploadFile(
    bucketName: string,
    productOrder: string,
    nameOfTracerStream: string,
    sectionName: string,
    file: File,
  ): Promise<any> {
    try {
      const prefix = `${productOrder}/${nameOfTracerStream}/${sectionName}`;
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(
        `File/UploadFile?bucketName=${bucketName}&prefix=${prefix}`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  }

  async DeleteFile(bucketName: string, key: string): Promise<any> {
    try {
      const keyEncoded = encodeURIComponent(key);
      const response = await axiosInstance.delete(
        `File/delete?bucketName=${bucketName}&key=${keyEncoded}`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete file');
    }
  }

  async getAllFiles(
    bucketName: string,
    prefix: string,
  ): Promise<S3ObjectDto[]> {
    try {
      const response = await axiosInstance.get(
        `File/AllFiles?bucketName=${bucketName}&prefix=${prefix}`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to get all files');
    }
  }
}

export const fileManagementApiProxy = new FileManagementProxy();

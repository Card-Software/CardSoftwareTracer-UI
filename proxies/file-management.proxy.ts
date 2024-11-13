import { S3ObjectDto } from '@/models/s3-object-dto';
import axiosInstance from '@/utils/axiosInstance';
import { Observable, from, map } from 'rxjs';
class FileManagementProxy {
  //#region
  UploadFile(
    bucketName: string,
    productOrder: string,
    nameOfTracerStream: string,
    sectionName: string,
    file: File,
  ): Observable<any> {
    const prefix = `${productOrder}/${nameOfTracerStream}/${sectionName}`;
    const formData = new FormData();
    formData.append('file', file);
    return from(
      axiosInstance.post(
        `File/UploadFile?bucketName=${bucketName}&prefix=${prefix}`,
        formData,
      ),
    );
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
  GetAllFiles(bucketName: string, prefix: string): Observable<S3ObjectDto[]> {
    return from(
      axiosInstance.get(
        `File/AllFiles?bucketName=${bucketName}&prefix=${prefix}`,
      ),
    ).pipe(map((response) => response.data));
  }
}

export const fileManagementApiProxy = new FileManagementProxy();

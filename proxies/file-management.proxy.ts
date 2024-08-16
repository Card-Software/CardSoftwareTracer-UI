import { S3ObjectDto } from '@/models/s3-object-dto';

class FileManagementProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';
  //#region
  async CreateBucket(bucketName: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}CreateBucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bucketName),
    });
    return await response.json();
  }

  async RetrieveBuckets(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}RetrieveBuckets`);
    return await response.json();
  }
  //#endregion
  //#region
  async UploadFile(
    bucketName: string,
    productOrder: string,
    nameOfTracerStream: string,
    sectionName: string,
    file: File,
  ): Promise<any> {
    const prefix = `${productOrder}/${nameOfTracerStream}/${sectionName}`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${this.baseUrl}File/UploadFile?bucketName=${bucketName}&prefix=${prefix}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response;
  }

  async DeleteFile(bucketName: string, key: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}File/delete?bucketName=${bucketName}&key=${key}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return await response;
  }

  async getAllFiles(
    bucketName: string,
    prefix: string,
  ): Promise<S3ObjectDto[]> {
    const response = await fetch(
      `${this.baseUrl}File/AllFiles?bucketName=${bucketName}&prefix=${prefix}`,
    );
    return await response.json();
  }

  async PreviewFile(
    bucketName: string,
    prefix: string,
    fileName: string,
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}File/preview?bucketName=${bucketName}&prefix=${prefix}&fileName=${fileName}`,
    );
    return await response.json();
  }
}

export const fileManagementApiProxy = new FileManagementProxy();
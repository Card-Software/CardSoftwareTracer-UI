import { ProductOrder } from '@/models/ProductOrder';
import { TracerStream } from '@/models/TracerStream';
import { Section } from '@/models/Section';
import { userAuthenticationService } from './UserAuthentication.service';
import { fileManagementApiProxy } from '@/proxies/FileManagement.proxy';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { S3ObjectDto } from '@/models/S3ObjectDto';

class FileManagementService {
  organization = userAuthenticationService.getOrganization();

  async downloadFilesFromS3Bucket(
    tracerStream: TracerStream,
    productOrder: ProductOrder,
    includeSections: Section[], // New parameter to include sections
  ): Promise<boolean> {
    if (!tracerStream || !productOrder || !this.organization?.s3BucketName) {
      throw new Error(
        'Missing required parameters or organization information.',
      );
    }

    const prefix = `${productOrder.productOrderNumber}/${tracerStream.id}`;
    const response = await fileManagementApiProxy.getAllFiles(
      this.organization.s3BucketName,
      prefix,
    );

    if (!response || response.length === 0) {
      console.warn('No files found for the given prefix.');
      return false;
    }

    const zip = new JSZip();
    const productOrderNumber = productOrder.externalProductOrderNumber
      ? productOrder.externalProductOrderNumber
      : productOrder.productOrderNumber;
    const folder = zip.folder(`P-0000${productOrderNumber}`);

    if (!folder) {
      throw new Error('Failed to create folder in zip file.');
    }

    const sectionNames = this.getSectionNames(response, tracerStream);

    // Filter the files based on the included sections
    const includedSectionIds = includeSections.map(
      (section) => section.sectionId,
    );
    const filteredFiles = response.filter((file) => {
      if (!file.name) {
        console.warn('File name is missing.');
        return false;
      }
      const sectionId = file.name.split('/')[2];
      return includedSectionIds.includes(sectionId);
    });

    for (const file of filteredFiles) {
      if (!file.name) {
        console.warn('File name is missing.');
        continue;
      }

      const sectionId = file.name.split('/')[2];
      const sectionName = sectionNames[sectionId];
      const fileExtension = file.name.split('.').pop();
      let fileName = `P-0000${productOrderNumber}_${sectionName}.${fileExtension}`;

      let counter = 1;
      while (folder.file(fileName)) {
        fileName = `P-0000${productOrderNumber}_${sectionName}${counter}.${fileExtension}`;
        counter++;
      }

      if (!file.presignedUrl) {
        console.warn(`Presigned URL is missing for file: ${file.name}`);
        continue;
      }

      const fileData = await this.fetchFileContent(file.presignedUrl);
      folder.file(fileName, fileData);
    }

    const content = await zip.generateAsync({ type: 'blob' });

    saveAs(content, `P-0000${productOrderNumber}.zip`);
    return true;
  }

  private async fetchFileContent(url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${url}, Status: ${response.status}`,
        );
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  private getSectionNames(
    files: S3ObjectDto[],
    tracerStream: TracerStream,
  ): { [key: string]: string } {
    if (!tracerStream) {
      throw new Error('TracerStream is required to fetch section names.');
    }

    const sectionIds = files.map((file) => file.name?.split('/')[2]);
    const sectionNames: { [key: string]: string } = {};

    for (const sectionId of sectionIds) {
      if (!sectionId) continue;
      const section = tracerStream.sections.find(
        (section) => section.sectionId === sectionId,
      );
      if (section) {
        sectionNames[sectionId] = section.sectionName;
      } else {
        console.warn(`Section with id ${sectionId} not found in tracerStream.`);
      }
    }

    return sectionNames;
  }
}

export const fileManagementService = new FileManagementService();

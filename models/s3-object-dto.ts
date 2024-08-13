import { View } from './view';

export interface S3ObjectDto {
  name: string;
  presignedUrl?: string;
  viewers?: View[];
  viewCount?: number;
}

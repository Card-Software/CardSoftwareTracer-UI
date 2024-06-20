import { View } from './View.model';

export interface S3ObjectDto {
  name?: string;
  presignedUrl?: string;
  viewers?: View[];
  viewCount?: number;
}

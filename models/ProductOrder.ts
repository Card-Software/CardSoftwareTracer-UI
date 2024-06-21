export interface ProductOrder {
  id?: string; // Corresponds to ObjectId in MongoDB
  productOrderNumber?: string;
  productOrderDate: Date;
  sections: ProductOrderSection[];
  client?: string;
  productOrderStatus?: string;
  description?: string;
  notes?: any[];
  s3BucketName?: string;
  s3BucketPath?: string;
}

export interface ProductOrderSection {
  sectionNumber: string;
  assignedTo?: string;
  description?: string;
  notes?: any[];
  sectionStatus: string;
  filesSection: ProductOrderFileSection[];
}

export interface ProductOrderFileSection {
  filesSectionNumber?: string;
  files: ProductOrderFile[];
}

export interface ProductOrderFile {
  fileName: string;
  uploadedBy: string;
  filePath: string;
}

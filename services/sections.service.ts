import { Section } from '@/models/section';
import { ObjectId } from 'bson';
import { userAuthenticationService } from './user-authentication.service';
import { fileManagementApiProxy } from '@/proxies/file-management.proxy';
import { BehaviorSubject } from 'rxjs';

export class SectionService {
  private static instance: SectionService | null = null;

  private loading = false;
  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private sections: Section[];
  private readonly productOrderId: string;
  private readonly productOrderNumber: string;
  private readonly tracerStreamId: string;
  editingSection: Section | null = null;
  private ownerRef: string;
  private readonly bucketName: string;

  constructor(sections: Section[], productOrderId: string, tracerStreamId: string, productOrderNumber: string) {
    this.sections = sections;
    this.productOrderId = productOrderId;
    this.tracerStreamId = tracerStreamId;
    this.productOrderNumber = productOrderNumber;
    this.ownerRef = userAuthenticationService.getOrganization()?.id || '';
    this.bucketName = userAuthenticationService.getOrganization()?.s3BucketName || '';
  }

  public static getInstance(
    sections?: Section[],
    productOrderId?: string,
    tracerStreamId?: string,
    productOrderNumber?: string,
  ): SectionService {
    if (!SectionService.instance) {
      if (!sections || !productOrderId || !tracerStreamId || !productOrderNumber) {
        throw new Error('SectionService has not been initialized with required parameters');
      }
      SectionService.instance = new SectionService(sections, productOrderId, tracerStreamId, productOrderNumber);
    }
    return SectionService.instance;
  }

  public static resetInstance(): void {
    SectionService.instance = null;
  }

  // #region Getters
  getSections(): Section[] {
    return this.sections;
  }

  getAllFiles(): void {
    if (this.editingSection === null) {
      throw new Error('No section to get files');
    }

    const oldPrefix = `${this.productOrderNumber}/${this.tracerStreamId}/${this.editingSection.sectionId}`;
    const newPrefix = `${this.productOrderId}/${this.tracerStreamId}/${this.editingSection.sectionId}`;

    fileManagementApiProxy
      .GetAllFiles(this.bucketName, `${this.productOrderId}/${this.tracerStreamId}/${this.editingSection.sectionId}`)
      .subscribe({
        next: (response) => {
          this.editingSection!.files = response;
        },
        error: (error) => {
          throw new Error('Failed to get files');
        },
      });
  }

  maxPosition(): number {
    if (this.editingSection === null) {
      return 0;
    }
    if (this.sections.findIndex((section) => section.sectionId === this.editingSection!.sectionId) !== -1) {
      return this.sections.length;
    } else {
      return this.sections.length + 1;
    }
  }

  // #endregion

  // #region Setters

  setEditingSection(sectionId: string): void {
    this.editingSection = this.sections.find((section) => section.sectionId === sectionId) || null;
  }

  // #region Conditionals

  canMoveToNextSection(position: number): boolean {
    if (position === this.sections.length) {
      return false;
    }
    return true;
  }

  canMoveToPreviousSection(position: number): boolean {
    if (position === 1) {
      return false;
    }
    return true;
  }

  // #endregion

  // #region Actions

  moveToNextSection(): void {
    if (this.editingSection === null) {
      throw new Error('No section to move');
    }

    const currentPosition = this.editingSection.position;

    this.saveSection();

    const nextSectionIndex = this.sections.findIndex((section) => section.position === currentPosition + 1);

    if (nextSectionIndex === -1) {
      throw new Error('No next section to move');
    }

    this.editingSection = this.sections[nextSectionIndex];
  }

  moveToPreviousSection(): void {
    if (this.editingSection === null) {
      throw new Error('No section to move');
    }

    const currentPosition = this.editingSection.position;

    this.saveSection();

    const previousSectionIndex = this.sections.findIndex((section) => section.position === currentPosition - 1);

    if (previousSectionIndex === -1) {
      throw new Error('No previous section to move');
    }

    this.editingSection = this.sections[previousSectionIndex];
  }

  createNewSection(): void {
    this.editingSection = {
      sectionId: new ObjectId().toString(),
      position: this.sections.length + 1,
      sectionName: '',
      sectionDescription: '',
      files: [],
      fileNameOnExport: '',
      assignedUser: null,
      notes: [],
      isRequired: false,
      ownerRef: this.ownerRef,
      teamLabels: [],
    };
  }

  saveSection(): void {
    if (this.editingSection === null) {
      throw new Error('No section to arrange');
    }

    this.sections = this.sections.filter((section) => section.sectionId !== this.editingSection!.sectionId);

    this.sections.push(this.editingSection);

    this.sections.sort((a, b) => a.position - b.position);

    for (let i = 1; i < this.sections.length; i++) {
      if (this.sections[i].position === this.sections[i - 1].position) {
        this.sections[i].position = this.sections[i - 1].position + 1;
      }
    }
    this.editingSection = null;
  }

  uploadFile(file: File): void {
    if (this.editingSection === null) {
      throw new Error('No section to upload file');
    }

    fileManagementApiProxy
      .UploadFile(this.bucketName, this.productOrderId, this.tracerStreamId, this.editingSection.sectionName, file)
      .subscribe({
        next: (response) => {
          this.getAllFiles();
          //   const insertLogs = (fileName: string, section: string) => {
          //     const activityLog: ActivityLog = {
          //       productOrderReference: productOrderId,
          //       activityType: ActivityType.FileUpload,
          //       fileName,
          //       section,
          //       productOrderNumber: productOrder || '',
          //       userFirstName: user?.firstName || '',
          //       userLastName: user?.lastname || '',
          //       timeStamp: new Date(),
          //       traceabilityStream: tracerStreamId || '',
          //     };
          //     activityLogProxy.insertActivityLog(activityLog);
          //   };
        },
        error: (error) => {
          throw new Error('Failed to upload file');
        },
      });
  }

  //   const handleFileDelete = async (s3Object: S3ObjectDto) => {
  //     if (fileToDelete) {
  //       await fileManagementApiProxy.DeleteFile(bucketName!, s3Object.name!);
  //       try {
  //         // await getAllFiles();
  //       } catch (error) {
  //         console.error('Error fetching files:', error);
  //       }
  //       setFileToDelete(null);
  //       setIsAlertModalOpen(false);
  //     }
  //   };

  cancelEditing(): void {
    this.editingSection = null;
  }
}

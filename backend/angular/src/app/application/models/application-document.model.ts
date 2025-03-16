export interface ApplicationDocument {
  id: number;
  type: string;
  name: string;
  size: number;
  contentType: string;
  uploadDate: string;
  content?: File;
}

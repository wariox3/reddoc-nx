import { Component, ElementRef, ViewChild, output, signal } from '@angular/core';
import { ImageCropperComponent as NgxCropper, ImageCroppedEvent } from 'ngx-image-cropper';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [NgxCropper, ButtonModule, MessageModule],
  templateUrl: './image-cropper.component.html',
})
export class ImageCropperComponent {
  readonly imageSaved = output<Blob>();
  readonly cancelled = output<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly imageChangedEvent = signal<Event | null>(null);
  readonly croppedImage = signal<string | null>(null);
  readonly tooBig = signal(false);

  private readonly MAX_BYTES = 2 * 1024 * 1024;
  private croppedBlob: Blob | null = null;

  selectFile(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event): void {
    this.imageChangedEvent.set(event);
    this.croppedImage.set(null);
    this.croppedBlob = null;
    this.tooBig.set(false);
  }

  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.tooBig.set(event.blob.size >= this.MAX_BYTES);
      if (!this.tooBig()) {
        this.croppedBlob = event.blob;
        const reader = new FileReader();
        reader.onloadend = () => this.croppedImage.set(reader.result as string);
        reader.readAsDataURL(event.blob);
      }
    } else if (event.base64) {
      this.croppedImage.set(event.base64);
    }
  }

  save(): void {
    if (this.croppedBlob) {
      this.imageSaved.emit(this.croppedBlob);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

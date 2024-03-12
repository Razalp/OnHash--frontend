import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';



interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropImageProps {
  media: any;
  onCropSubmit: (croppedImg: string) => void;
}

const CropImage: React.FC<CropImageProps> = ({ media, onCropSubmit }) => {
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Crop | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cropperVisible, setCropperVisible] = useState<boolean>(true);
  const [showCropped, setShowCropped] = useState<boolean>(false);

  const onCropComplete = (croppedArea: Crop) => {
    setCroppedAreaPixels(croppedArea);
  };

  const showCroppedImage = async () => {
    try {
      const image = new Image();
      image.src = media.url;

      const croppedImg = await getCroppedImg(image, croppedAreaPixels!, 'cropped.jpg');
      console.log("Cropped Image URL:", croppedImg); // Log the cropped image URL
      setCroppedImage(croppedImg);
      setShowCropped(true); // Show cropped image preview
      setCropperVisible(false); // Hide cropper after crop

      // Pass cropped image to parent component
      if (croppedImg) {
        onCropSubmit(croppedImg);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop, fileName: string) => {
    const scaleX = image.naturalWidth / media.width;
    const scaleY = image.naturalHeight / media.height;
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d')!;

    try {
      ctx.drawImage(
        image,
        Math.round(crop.x * scaleX),
        Math.round(crop.y * scaleY),
        Math.round(crop.width * scaleX),
        Math.round(crop.height * scaleY),
        0,
        0,
        crop.width,
        crop.height
      );
    } catch (error) {
      console.error('Error drawing image on canvas:', error);
      return null;
    }

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob:any) => {
          if (!blob) {
            console.error('Canvas is empty');
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = fileName;
          resolve(window.URL.createObjectURL(blob));
        },
        'image/jpeg',
        1
      );
    });
  };

  return (
    <div>
      {media && cropperVisible && (
        <div>
<Cropper
  image={media.url}
  crop={crop}
  zoom={zoom}
  aspect={8 / 11}
  onCropChange={newCrop => setCrop({ ...crop, ...newCrop })} 
  onCropComplete={onCropComplete}
  onZoomChange={setZoom}
/>


          <div style={{ position: 'relative', zIndex: 1 }}>
            <Button variant='destructive' className='w-16 h-10 ' onClick={showCroppedImage}>Crop</Button>
          </div>
        </div>
      )}
      {showCropped && croppedImage && (
        <div>
          <img src={croppedImage} alt="Cropped" className='w-72 h-96' />
        </div>
      )}
    </div>
  );
};

export default CropImage;

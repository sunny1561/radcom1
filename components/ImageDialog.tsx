"use client"

import Image from 'next/image';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageData {
  metadata: {
    description: string;
    title: string;
    id: string;
    image_path: string;
  };
}

interface ImageDialogProps {
  imageData: ImageData[];
  content: string;
}

const ImageDialog: React.FC<ImageDialogProps> = ({ imageData, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setIsOpen(true);
  };
  const formatContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      if (line.match(/^\d+\./)) {
        return (
          <li key={index} className="ml-6 list-decimal">
            {line.replace(/^\d+\./, "").trim()}
          </li>
        );
      } else if (line.trim().startsWith("-")) {
        return (
          <li key={index} className="ml-6 list-disc">
            {line.replace(/^-/, "").trim()}
          </li>
        );
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <>
        {imageData?.length>0&&<strong>Images:</strong>}
        
      <div className="p-4 grid grid-cols-3 gap-4">
        {imageData.map((image) => (
          <div
            key={image.metadata.id}
            className="cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <Image
              src={`/diagrams/${image.metadata.image_path}`}
              alt={image.metadata.description}
              width={200}
              height={200}
            />
            
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90%] w-[90%] h-[90vh] p-0 m-0">
          <div className="flex h-screen">
            <div className="w-1/2 h-full relative">
              {selectedImage && (
                <Image
                  src={`/diagrams/${selectedImage.metadata.image_path}`}
                  alt={selectedImage.metadata.description}
                  layout="fill"
                  objectFit="contain"
                />
              )}
            </div>
            <div className="w-1/2 h-full flex items-center">
              <div className="p-6 overflow-y-auto max-h-[70%]">
                <DialogHeader className='overflow-auto max-h-[80%]'>
                  <DialogTitle>{selectedImage?.metadata.title}</DialogTitle>
                  <DialogDescription>{formatContent(content)}</DialogDescription>
                </DialogHeader>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageDialog;
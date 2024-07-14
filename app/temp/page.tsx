// import { ChatgptVersionSelector } from '@/components/ChatGPTVersionCombobox'
import { ChatgptVersionSelector} from '@/components/ChatGPTVersionCombobox'
import { DialogDemo } from '@/components/DialogDemo'
import ImageDialog from '@/components/ImageDialog'
import QueryComponent from '@/components/QueryComponent'
import { Sidebar } from '@/components/Sidebar2'
// import Sidebar from '@/components/Sidebar2'
import ZoomingDot from '@/components/ZoomingDot'
import React from 'react'

const page = () => {
  const imageData = [
    {
      metadata: {
        description: 'Image 1',
        title: 'Title 1',
        id: '1',
        image_path: '/img1.jpg',
      },
    },
    {
      metadata: {
        description: 'Image 2',
        title: 'Title 2',
        id: '2',
        image_path: '/img1.jpg',
      },
    },
    // Add more image data as needed
  ];
  
  const content = 'This is some content related to the images.';
  return (
    <div>

      <QueryComponent/>
      <DialogDemo/>
      <ChatgptVersionSelector/>
      <ImageDialog imageData={imageData} content={content} />
      <ZoomingDot/>
      <Sidebar/>
    
    </div>
  )
}

export default page
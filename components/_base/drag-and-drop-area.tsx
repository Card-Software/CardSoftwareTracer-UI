import React, { useRef } from 'react';
import '@/styles/base-components/drag-and-drop-area.css';
import TracerButton from '../tracer-button.component';

interface DragAndDropAreaProps {
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

const DragAndDropArea: React.FC<DragAndDropAreaProps> = ({
  onDrop,
  onFileSelect,
  label = 'Drag & drop files here or click to upload',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="drag-and-drop-area"
      onDragOver={handleDragOver}
      onDrop={onDrop}
      onClick={handleClick}
    >
      <label>{label}</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
      <TracerButton name="Upload" />
    </div>
  );
};

export default DragAndDropArea;

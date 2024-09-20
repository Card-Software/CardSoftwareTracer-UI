import { ProductOrder } from '@/models/product-order';
import { TracerStreamExtended } from '@/models/tracer-stream';
import React, { useEffect } from 'react';

interface ProgressBarProps {
  productOrder: ProductOrder;
  onProgressChange: (progress: number | null) => void; // New prop
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  productOrder,
  onProgressChange,
}) => {
  const totalTracerStreams = productOrder.childrenTracerStreams.length;

  const singleTracerStreamProgress = (stream: TracerStreamExtended) => {
    const requiredSections = stream.sections.filter(
      (section) => section.isRequired,
    );
    const completedSections = requiredSections.filter(
      (section) => section.files.length > 0,
    );
    return (completedSections.length / requiredSections.length) * 100;
  };

  const overallProgress = () => {
    if (totalTracerStreams === 0) {
      return null;
    }
    if (totalTracerStreams === 1) {
      return singleTracerStreamProgress(productOrder.childrenTracerStreams[0]);
    }

    const totalRequiredSections = productOrder.childrenTracerStreams.reduce(
      (acc, stream) => {
        return (
          acc + stream.sections.filter((section) => section.isRequired).length
        );
      },
      0,
    );

    const totalCompletedSections = productOrder.childrenTracerStreams.reduce(
      (acc, stream) => {
        return (
          acc +
          stream.sections.filter(
            (section) => section.isRequired && section.files.length > 0,
          ).length
        );
      },
      0,
    );

    return (totalCompletedSections / totalRequiredSections) * 100;
  };

  const progressPercentage = overallProgress();

  useEffect(() => {
    // Pass the percentage value to the parent when it changes
    onProgressChange(progressPercentage);
  }, [progressPercentage, onProgressChange]);

  return (
    <div className="relative mt-2 h-2 w-full rounded-md bg-gray-300">
      {progressPercentage !== null && (
        <div
          className="h-full rounded-md bg-blue-500"
          style={{ width: `${progressPercentage}%` }}
        />
      )}
    </div>
  );
};

export default ProgressBar;

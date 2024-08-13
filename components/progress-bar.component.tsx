import { ProductOrder } from '@/models/product-order';
import { TracerStreamExtended } from '@/models/tracer-stream';
import React from 'react';

interface ProgressBarProps {
  productOrder: ProductOrder;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ productOrder }) => {
  const totalTracerStreams = productOrder.childrenTracerStreams.length;

  // Calculate progress for a single tracer stream
  const singleTracerStreamProgress = (stream: TracerStreamExtended) => {
    const requiredSections = stream.sections.filter(
      (section) => section.isRequired,
    );
    const completedSections = requiredSections.filter(
      (section) => section.files.length > 0,
    );
    return (completedSections.length / requiredSections.length) * 100;
  };

  // Calculate overall progress for multiple tracer streams
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

  return (
    <div className="relative mt-2 h-4 w-full bg-gray-200">
      {progressPercentage === null ? (
        <div className="flex h-full items-center justify-center bg-gray-500 text-xs text-gray-700">
          N/T
        </div>
      ) : (
        <>
          <div
            className="h-full bg-green-500"
            style={{ width: `${progressPercentage}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700">
            {progressPercentage.toFixed(0)}%
          </span>
        </>
      )}
    </div>
  );
};

export default ProgressBar;

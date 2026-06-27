import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { FileIcon, Download, XCircle, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface FilePreviewCardProps {
  file?: File;
  fileName?: string;
  fileSize?: number;
  status: string;
  progress: number;
  downloadUrl?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
}

export function FilePreviewCard({
  file,
  fileName,
  fileSize,
  status,
  progress,
  downloadUrl,
  errorMessage,
  onRetry,
  onCancel,
  onDownload,
}: FilePreviewCardProps) {
  const name = fileName || file?.name || 'Document';
  const size = fileSize || file?.size || 0;
  const formattedSize = size > 0 ? (size / 1024 / 1024).toFixed(2) + ' MB' : '';

  const isFailed = status === 'FAILED' || status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';

  return (
    <Card className="p-4 border border-border-base bg-bg-surface w-full max-w-lg mx-auto shadow-sm rounded-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          {isCompleted ? <CheckCircle2 size={32} className="text-green-500" /> : <FileIcon size={32} />}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-text-primary break-all line-clamp-1" title={name}>
                {name}
              </h4>
              <p className="text-sm text-text-secondary">{formattedSize}</p>
            </div>
            {onCancel && !isCompleted && !isFailed && (
              <Button variant="ghost" size="icon" onClick={onCancel} className="text-text-muted hover:text-red-500" title="Cancel">
                <XCircle size={20} />
              </Button>
            )}
          </div>

          {/* Progress & Status */}
          {!isCompleted && !isFailed && (
            <div className="w-full space-y-1 mt-2">
              <div className="flex justify-between text-xs text-text-secondary font-medium">
                <span className="capitalize">{status.toLowerCase()}...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 w-full transition-all duration-300" />
            </div>
          )}

          {/* Error State */}
          {isFailed && (
            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle size={16} />
                <span>Processing Failed</span>
              </div>
              <p className="text-xs text-red-500">{errorMessage || 'An unknown error occurred.'}</p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry} className="w-fit text-xs h-7 mt-1">
                  <RefreshCw size={14} className="mr-1" /> Retry
                </Button>
              )}
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="mt-2">
              {downloadUrl && onDownload && (
                <Button onClick={onDownload} className="w-full bg-primary hover:bg-primary-hover text-white">
                  <Download size={16} className="mr-2" /> Download Result
                </Button>
              )}
              {!onDownload && downloadUrl && (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                    <Download size={16} className="mr-2" /> Download Result
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

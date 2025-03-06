import {
  formatSize,
  formatSpeed,
  timeAgo,
  formatDate,
} from './utils/formatters';
import DownloadStateBadge from './DownloadStateBadge';
import ItemActions from './ItemActions';
import Tooltip from '@/components/shared/Tooltip';
import { Icons } from '@/components/icons';
import useIsMobile from '@/hooks/useIsMobile';
import FileList from './FileList';
import { useTranslations } from 'next-intl';

export default function ItemCard({
  item,
  index,
  selectedItems,
  isBlurred,
  isDisabled,
  activeColumns,
  onItemSelect,
  onFileSelect,
  onFileDownload,
  onDelete,
  toggleFiles,
  expandedItems,
  setItems,
  setSelectedItems,
  setToast,
  activeType,
  viewMode,
  isCopying,
  isDownloading,
}) {
  const columnT = useTranslations('Columns');
  const isMobile = useIsMobile();

  const filteredColumns = activeColumns.filter(
    (column) =>
      ![
        'name',
        'progress',
        'download_state',
        'download_speed',
        'upload_speed',
      ].includes(column),
  );

  const getTooltipContent = (column) => {
    switch (column) {
      case 'id':
        return columnT('id');
      case 'hash':
        return columnT('hash');
      case 'seeds':
        return columnT('seeds');
      case 'peers':
        return columnT('peers');
      case 'ratio':
        return columnT('ratio');
      case 'size':
        return columnT('size');
      case 'file_count':
        return columnT('file_count');
      case 'created_at':
        return columnT('created_at');
      case 'updated_at':
        return columnT('updated_at');
      case 'expires_at':
        return columnT('expires_at');
      case 'eta':
        return columnT('eta');
      case 'total_downloaded':
        return columnT('total_downloaded');
      case 'total_uploaded':
        return columnT('total_uploaded');
      case 'original_url':
        return columnT('original_url');
    }
  };

  const getColumnIcon = (column) => {
    switch (column) {
      case 'id':
        return Icons.arrow_left_right;
      case 'hash':
        return Icons.hash;
      case 'seeds':
        return Icons.up_arrow;
      case 'peers':
        return Icons.down_arrow;
      case 'ratio':
        return Icons.percent;
      case 'size':
        return Icons.layers;
      case 'file_count':
        return Icons.file;
      case 'created_at':
      case 'updated_at':
      case 'expires_at':
        return Icons.clock;
      case 'eta':
        return Icons.clock_arrow_down;
      case 'total_downloaded':
        return Icons.cloud_download;
      case 'total_uploaded':
        return Icons.cloud_upload;
      case 'original_url':
        return Icons.link;
    }
  };

  const getColumnValue = (column, item) => {
    switch (column) {
      case 'id':
        return item.id;
      case 'hash':
        return item.hash;
      case 'seeds':
        return item.seeds;
      case 'peers':
        return item.peers;
      case 'ratio':
        return item.ratio?.toFixed(1);
      case 'size':
        return formatSize(item.size || 0);
      case 'file_count':
        return item.files?.length || 0;
      case 'created_at':
        return timeAgo(item.created_at);
      case 'updated_at':
        return timeAgo(item.updated_at);
      case 'expires_at':
        return timeAgo(item.expires_at);
      case 'eta':
        return timeAgo(item.eta);
      case 'total_downloaded':
        return formatSize(item.total_downloaded);
      case 'total_uploaded':
        return formatSize(item.total_uploaded);
      case 'original_url':
        return item.original_url;
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.shiftKey) {
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        if (isDisabled(item.id)) return;
        const isChecked = selectedItems.items?.has(item.id);
        onItemSelect(item.id, !isChecked, index, e.shiftKey);
      }}
      className={`${
        selectedItems.items?.has(item.id)
          ? 'bg-surface-alt-selected hover:bg-surface-alt-selected-hover dark:bg-surface-alt-selected-dark dark:hover:bg-surface-alt-selected-hover-dark'
          : 'bg-surface hover:bg-surface-alt-hover dark:bg-surface-dark dark:hover:bg-surface-alt-hover-dark'
      } px-2 py-4 md:p-4 relative rounded-lg border border-border dark:border-border-dark overflow-hidden cursor-pointer`}
    >
      <div className="flex justify-between gap-2">
        <div className="flex flex-col justify-between gap-2 min-w-0">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedItems.items?.has(item.id)}
              onChange={(e) => onItemSelect(item.id, e.target.checked, index)}
              onClick={(e) => e.stopPropagation()}
              disabled={isDisabled(item.id)}
              className="accent-accent dark:accent-accent-dark flex-shrink-0"
            />
            <h3
              className={`text-sm sm:text-md md:text-[18px] font-medium break-all text-primary-text dark:text-primary-text-dark flex-1 ${
                isBlurred ? 'blur-sm select-none' : ''
              }`}
            >
              <Tooltip content={item.name || 'Unnamed Item'}>
                {item.name || 'Unnamed Item'}
              </Tooltip>
            </h3>
          </div>

          <div
            className={`flex items-center ${
              isMobile ? 'gap-2' : 'gap-4'
            } text-xs md:text-sm text-primary-text/70 dark:text-primary-text-dark/70`}
          >
            <DownloadStateBadge
              item={item}
              size={isMobile ? 'xs' : 'default'}
            />
            {!isMobile ? (
              <>
                {filteredColumns.map((column) => (
                  <div
                    className="flex items-center gap-1 font-semibold"
                    key={column}
                  >
                    <div className="flex items-center gap-1">
                      <Tooltip content={getTooltipContent(column)}>
                        {getColumnIcon(column)}{' '}
                      </Tooltip>
                      {['created_at', 'updated_at', 'expires_at'].includes(
                        column,
                      ) ? (
                        <Tooltip content={formatDate(item[column])}>
                          <span>{getColumnValue(column, item)}</span>
                        </Tooltip>
                      ) : (
                        <span>{getColumnValue(column, item)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <span>{formatSize(item.size || 0)}</span> •{' '}
                <span>{timeAgo(item.created_at)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
          <ItemActions
            item={item}
            onDelete={onDelete}
            toggleFiles={toggleFiles}
            expandedItems={expandedItems}
            setItems={setItems}
            setSelectedItems={setSelectedItems}
            setToast={setToast}
            activeType={activeType}
            viewMode={viewMode}
          />

          {item.active && (
            <div className="flex items-center gap-4 text-sm md:text-[14.5px] text-primary-text/70 dark:text-primary-text-dark/70">
              <div className="flex items-center gap-1">
                <span className="text-label-success-text-dark dark:text-label-success-text-dark">
                  ↓
                </span>
                <span>{formatSpeed(item.download_speed)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-label-danger-text-dark dark:text-label-danger-text-dark">
                  ↑
                </span>
                <span>{formatSpeed(item.upload_speed)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {expandedItems.has(item.id) && item.files && item.files.length > 0 && (
        <FileList
          files={item.files}
          itemId={item.id}
          selectedItems={selectedItems}
          isDisabled={isDisabled(item.id)}
          isBlurred={isBlurred}
          onFileSelect={onFileSelect}
          onFileDownload={onFileDownload}
          isCopying={isCopying}
          isDownloading={isDownloading}
          isMobile={isMobile}
        />
      )}

      {item.progress < 1 && item.active && !item.download_present && (
        <div className="absolute bottom-0 left-0 w-full">
          {item.progress !== undefined && (
            <div
              className="bg-blue-600/40 dark:bg-blue-500/40 h-1 rounded-full"
              style={{ width: `${(item.progress || 0) * 100}%` }}
            ></div>
          )}
        </div>
      )}
    </div>
  );
}

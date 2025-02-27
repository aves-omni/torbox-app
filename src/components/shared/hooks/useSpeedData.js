import { useState, useEffect, useRef } from 'react';

// Maximum number of data points to keep in history
const MAX_DATA_POINTS = 2000;
// Update interval in milliseconds
const UPDATE_INTERVAL = 10000;
// Minimum interval between updates when there's no activity
const IDLE_UPDATE_INTERVAL = 5000;

// Helper to ensure valid numeric values
const ensureValidNumber = (value) => {
  if (value === null || value === undefined || isNaN(value) || value < 0) {
    return 0;
  }
  return value;
};

export function useSpeedData(items) {
  const [speedData, setSpeedData] = useState({
    labels: [],
    download: [],
    upload: [],
  });

  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const hasActivityRef = useRef(false);

  useEffect(() => {
    // Function to update speed data
    const updateSpeedData = () => {
      if (!items || items.length === 0) return;

      const now = Date.now();

      // Calculate total download and upload speeds
      const totalDownloadSpeed = items
        .filter((item) => item.active === true)
        .reduce((total, item) => {
          return total + ensureValidNumber(item.download_speed);
        }, 0);

      const totalUploadSpeed = items
        .filter((item) => item.active === true)
        .reduce((total, item) => {
          return total + ensureValidNumber(item.upload_speed);
        }, 0);

      // Check if there's any activity
      const currentHasActivity = totalDownloadSpeed > 0 || totalUploadSpeed > 0;

      // If no activity and we updated recently, skip this update
      if (
        !currentHasActivity &&
        !hasActivityRef.current &&
        now - lastUpdateRef.current < IDLE_UPDATE_INTERVAL
      ) {
        return;
      }

      // Update activity status
      hasActivityRef.current = currentHasActivity;
      lastUpdateRef.current = now;

      // Get current time for the label
      const timeLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Update speed data state
      setSpeedData((prevData) => {
        // Create new arrays with the latest data point added
        const newLabels = [...prevData.labels, timeLabel];
        // Round the values to integers
        const newDownload = [
          ...prevData.download,
          Math.round(totalDownloadSpeed),
        ];
        const newUpload = [...prevData.upload, Math.round(totalUploadSpeed)];

        // Limit the number of data points
        return {
          labels: newLabels.slice(-MAX_DATA_POINTS),
          download: newDownload.slice(-MAX_DATA_POINTS),
          upload: newUpload.slice(-MAX_DATA_POINTS),
        };
      });
    };

    // Initial update
    updateSpeedData();

    // Set up interval for regular updates
    intervalRef.current = setInterval(updateSpeedData, UPDATE_INTERVAL);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items]);

  return speedData;
}

import { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CameraContext = createContext();

export const useCameraContext = () => {
  return useContext(CameraContext);
};

export const CameraProvider = ({ children }) => {
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isActiveRef = useRef(false);

  // Cleanup function to stop camera
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    isActiveRef.current = false;
    console.log('Camera cleaned up');
  }, []);

  // Start video stream
  const startVideo = useCallback(async () => {
    try {
      // If camera is already active, stop it first
      if (isActiveRef.current) {
        cleanup();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 560 } },
      });
      videoRef.current.srcObject = stream;
      isActiveRef.current = true;
      toast.success("Camera activated. Please align your face inside the frame.");
      console.log('Camera started');
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error("Failed to access the camera.");
    }
  }, [cleanup]);

  // Stop video stream
  const stopVideo = useCallback(() => {
    cleanup();
    console.log('Camera stopped');
  }, [cleanup]);

  // Force stop camera (for navigation)
  const forceStopCamera = useCallback(() => {
    if (isActiveRef.current) {
      cleanup();
      console.log('Camera force stopped due to navigation');
    }
  }, [cleanup]);

  // Listen for route changes
  useEffect(() => {
    forceStopCamera();
  }, [location.pathname, forceStopCamera]);

  // Setup event listeners for camera cleanup
  useEffect(() => {
    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && isActiveRef.current) {
        cleanup();
        console.log('Camera stopped due to page visibility change');
      }
    };

    // Listen for beforeunload event
    const handleBeforeUnload = () => {
      if (isActiveRef.current) {
        cleanup();
        console.log('Camera stopped due to beforeunload');
      }
    };

    // Listen for popstate (navigation)
    const handlePopState = () => {
      if (isActiveRef.current) {
        cleanup();
        console.log('Camera stopped due to popstate');
      }
    };

    // Listen for pagehide event (when navigating away)
    const handlePageHide = () => {
      if (isActiveRef.current) {
        cleanup();
        console.log('Camera stopped due to pagehide');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [cleanup]);

  const value = {
    videoRef,
    canvasRef,
    animationFrameRef,
    startVideo,
    stopVideo,
    forceStopCamera,
    isActive: isActiveRef.current
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
}; 
import React, { useEffect, useState, useRef } from 'react';
import { imageToBase64 } from '../utils/ImageUtils';
import { fetchImageAnalysis } from '../utils/Api';
import LoadingSpinner from './LoadingSpinner';
import VideoCard from './VideoCard';

const ImageSearch = () => {
  // --- State Management ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  // --- New State for Camera ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  // --- Refs for video and canvas ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- New Effect for Camera Cleanup ---
  useEffect(() => {
    // Cleanup function to stop the stream when component unmounts or stream changes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  /**
   * Handles the file input change event
   */
  const handleFileChange = (event) => {
    // Close camera if it's open
    if (isCameraOpen) {
      handleCloseCamera();
    }
    
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setApiResponse(null); // Clear old response
      setErrorMessage(null); // Clear old error

      // Create a temporary local URL for the image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // --- New Camera Handling Functions ---

  /**
   * Opens the device camera and streams to the video element.
   */
  const handleOpenCamera = async () => {
    // Clear any previous state
    setSelectedFile(null);
    setImagePreview(null);
    setApiResponse(null);
    setErrorMessage(null);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          // Prefer the rear camera
          facingMode: "environment" 
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsCameraOpen(true);
      
      // Attach stream to video element
      // Use a timeout to ensure videoRef is available after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      }, 0);

    } catch (err) {
      console.error("Error opening camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission was denied. Please allow camera access in your browser settings.");
      } else {
        setErrorMessage("Could not open camera. It might be in use or not available.");
      }
      setIsCameraOpen(false);
    }
  };

  /**
   * Stops the camera stream and closes the camera UI.
   */
  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  };

  /**
   * Captures a snapshot from the video stream.
   */
  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw video frame onto canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Get data URL for preview
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImagePreview(dataUrl);

    // Convert canvas to blob and then to a File object
    canvas.toBlob((blob) => {
      if (blob) {
        const snapshotFile = new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });
        setSelectedFile(snapshotFile);
      }
    }, 'image/jpeg', 0.95); // 0.95 quality

    // Close the camera
    handleCloseCamera();
  };


  /**
   * Handles the "Analyze Image" button click
   */
  const handleAnalyzeImage = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select an image first.");
      return;
    }

    // --- Reset UI ---
    setIsLoading(true);
    setErrorMessage(null);
    setApiResponse(null);

    try {
      // --- Start Analysis ---
      // 1. Convert image to base64
      const base64ImageData = await imageToBase64(selectedFile);
      
      // 2. Call the extracted API function
      const result = await fetchImageAnalysis(base64ImageData, selectedFile.type);
      
      // 3. Set the response
      setApiResponse(result);

    } catch (error) {
      // --- Handle Errors ---
      console.error("Error analyzing image:", error);
      setErrorMessage(`Failed to analyze image. ${error.message}. Please try again.`);
    } finally {
      // --- Final Step ---
      setIsLoading(false);
    }
  };

  return (
    <section id="search" className="mb-16 scroll-mt-24">
      {/* Hidden canvas for taking snapshots */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      <h2 className="text-3xl font-bold mb-6 border-l-4 border-teal-500 pl-4">📸 Find Projects by Photo</h2>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Image Uploader Column */}
          <div className="flex flex-col">
            <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">Upload a photo of your waste item:</label>
            
            {/* --- File Input --- */}
            <input 
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-green-100 file:text-green-700
                hover:file:bg-green-200 transition"
            />
            
            {/* --- "Or" Separator --- */}
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* --- Camera Button --- */}
            <button
              onClick={handleOpenCamera}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Use Your Camera
            </button>

            <p className="text-xs text-gray-500 mt-4">The AI will identify it and find relevant project ideas.</p>
            
            {/* --- Analyze Button --- */}
            <button
              onClick={handleAnalyzeImage}
              disabled={isLoading || !selectedFile}
              className="mt-6 w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>

          {/* Image Preview Column */}
          <div className="flex items-center justify-center">
            {isCameraOpen ? (
              // --- Camera View ---
              <div className="w-full flex flex-col items-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full max-h-64 rounded-lg shadow-md bg-gray-900"
                  // Muted is important for autoplay
                  muted 
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleTakeSnapshot}
                    className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Take Snapshot
                  </button>
                  <button
                    onClick={handleCloseCamera}
                    className="flex-1 bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              // --- Snapshot/Upload View ---
              <img src={imagePreview} alt="Selected waste item" className="max-h-64 rounded-lg shadow-md object-contain" />
            ) : (
              // --- Placeholder View ---
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Image preview will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* --- Results Area (Conditional Rendering) --- */}
        <div className="mt-10">
          
          {/* Show loading spinner if isLoading is true */}
          {isLoading && <LoadingSpinner />}
          
          {/* Show error message if errorMessage exists */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          {/* Show API response if it exists */}
          {apiResponse && (
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Project Ideas for: <span className="text-green-700">{apiResponse.itemName}</span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Map over the video suggestions and render a VideoCard for each */}
                {apiResponse.videoSuggestions.map((video, index) => {
                  return (
                    <VideoCard
                      key={index}
                      // We pass the embedUrl to videoLink.
                      // The VideoCard component will handle the rest.
                      videoLink={video.embedUrl}
                      title={video.title}
                      channel={video.channel}
                      description={video.description}
                      // imageUrl and imageAlt are not needed since VideoCard will show the iframe
                      imageUrl={null} 
                      imageAlt={video.title}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default ImageSearch;

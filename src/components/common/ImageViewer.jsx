import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize,
  Minimize,
  Trash2,
  Eye,
} from "lucide-react";
import Button from "../common/Button";

const ImageViewer = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  onImageChange,
  onDelete, // Nueva prop para eliminar imagen
  showDeleteButton = false, // Mostrar o no el botón de eliminar
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const currentImage = images[currentIndex];

  // Reset transformations when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          previousImage();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "0":
          resetZoom();
          break;
        case "r":
          rotateImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isOpen, currentIndex, images.length]);

  const nextImage = () => {
    if (images.length > 1) {
      const newIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    }
  };

  const previousImage = () => {
    if (images.length > 1) {
      const newIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.1));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  // Wheel zoom - Fixed for passive event listeners
  const handleWheel = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, []);

  // Download image
  const downloadImage = async () => {
    if (currentImage) {
      try {
        const response = await fetch(currentImage.url || currentImage.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = currentImage.name || `image-${currentIndex + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    }
  };

  if (!isOpen || !currentImage || !images.length) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header with controls */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            {/* Left side - Image counter */}
            <div className="text-sm">
              {images.length > 1 && (
                <span>
                  {currentIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Center - Image title */}
            <div className="flex-1 text-center">
              <h3 className="text-lg font-medium truncate px-4">
                {currentImage.name || currentImage.alt || "Imagen"}
              </h3>
            </div>

            {/* Right side - Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Main image container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={previousImage}
                className="absolute left-4 z-10 text-white hover:bg-white/20 rounded-full"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={nextImage}
                className="absolute right-4 z-10 text-white hover:bg-white/20 rounded-full"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <motion.img
            ref={imageRef}
            src={currentImage.url || currentImage.src}
            alt={currentImage.alt || "Imagen"}
            className={`max-w-full max-h-full object-contain select-none ${
              scale > 1 ? "cursor-move" : "cursor-zoom-in"
            } ${isDragging ? "cursor-grabbing" : ""}`}
            onLoad={() =>
              console.log(
                "[ImageViewer] Image loaded:",
                currentImage.url || currentImage.src
              )
            }
            onError={() =>
              console.error(
                "[ImageViewer] Image failed to load:",
                currentImage.url || currentImage.src
              )
            }
            animate={{
              scale: scale,
              rotate: rotation,
              x: position.x / scale,
              y: position.y / scale,
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 150,
              duration: isDragging ? 0 : 0.3,
            }}
            style={{
              transformOrigin: "center",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
            onDoubleClick={() => (scale === 1 ? zoomIn() : resetZoom())}
            draggable={false}
          />
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.1}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-white hover:bg-white/20 px-3"
            >
              {Math.round(scale * 100)}%
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 5}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>

            <div className="w-px h-6 bg-white/30 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              onClick={rotateImage}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>

            {showDeleteButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onDelete) {
                    onDelete(currentIndex, currentImage);
                    onClose();
                  }
                }}
                className="text-white hover:bg-red-500/30 hover:text-red-200"
                title="Eliminar imagen"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={downloadImage}
              className="text-white hover:bg-white/20"
              title="Descargar imagen"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Loading indicator for next/prev images */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  onImageChange?.(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;

import React, { useEffect, useRef, useState } from 'react';

interface StaticAvatarProps {
  src: string | null;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const StaticAvatar: React.FC<StaticAvatarProps> = ({ src, alt, className, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGif, setIsGif] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Check if it's a GIF
    const isGifFile = src.toLowerCase().endsWith('.gif') || src.includes('image/gif') || src.includes('upload/v');
    // Note: Cloudinary URLs might not end in .gif but have it in the path or as a format.
    // For simplicity, we'll try to draw it to a canvas regardless if we want a static version.
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
    
    setIsGif(isGifFile);
  }, [src]);

  if (!src) {
    return (
      <div 
        onClick={onClick}
        className={`bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 ${className}`}
      >
        <span className="text-emerald-500 font-black text-xs">{alt.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div onClick={onClick} className={`relative overflow-hidden cursor-pointer group ${className}`}>
      {/* If it's a GIF, we show the canvas which contains only the first frame drawn during onload */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
        style={{ display: isGif ? 'block' : 'none' }}
      />
      {/* If it's not a GIF, we just show the normal image */}
      {!isGif && (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 border border-white/10 rounded-full group-hover:border-emerald-500/50 transition-colors" />
    </div>
  );
};

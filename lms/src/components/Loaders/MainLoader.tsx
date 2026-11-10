import React, { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

interface MainLoaderProps {
  className?: string;
}

const MainLoader = ({ className }: MainLoaderProps) => {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, size: number, speed: number, opacity: number }[]>([]);

  useEffect(() => {
    // Generate particles for magical effect
    const newParticles = Array(15).fill(0).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y - p.speed,
        opacity: p.y < 10 ? p.opacity * 0.95 : p.opacity,
        x: p.x + (Math.random() - 0.5) * 0.5
      })).map(p => p.y <= 0 || p.opacity <= 0.05 ?
        { ...p, y: 100 + Math.random() * 20, opacity: Math.random() * 0.5 + 0.3 } : p
      ));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("fixed inset-0 flex flex-col items-center justify-center bg-white z-50", className)}>
      <div className="flex flex-col items-center gap-4">
        {/* Premium book with dynamic effects */}
        <div className="relative h-28 w-36 perspective-1200">
          {/* Dynamic ambient glow effect */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-4 w-[85%] rounded-full opacity-80"
            style={{
              background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)",
              filter: "blur(8px)",
              animation: "pulse-glow 3s infinite alternate"
            }}
            role="presentation"
            aria-hidden="true" />

          {/* Book outer shadow for depth */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-3 w-[95%] bg-black/15 blur-md rounded-full"
            role="presentation"
            aria-hidden="true" />

          {/* Book cover with premium gradient and texture */}
          <div
            className="absolute bottom-0 h-28 w-full rounded-lg loaderBgColor"
            style={{
              // background: "linear-gradient(145deg, #6366f1 0%, #4f46e5 55%, #4338ca 100%)",
              boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
              backgroundImage: `
                linear-gradient(145deg, #6366f1 0%, #4f46e5 55%, #4338ca 100%),
                url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")
              `,
            }}
            role="presentation"
            aria-hidden="true">

            {/* Moving light reflection on book cover */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute -inset-full opacity-30"
                style={{
                  background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 45%, transparent 50%)",
                  animation: "shimmer 3s infinite"
                }} />
            </div>
          </div>

          {/* Gold embossed title on cover */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center"
            role="presentation"
            aria-hidden="true">
            <div className="text-lg font-bold tracking-wide"
              style={{
                color: "transparent",
                background: "linear-gradient(180deg, #f7e373 0%, #eac54f 30%, #e6a417 70%, #d69323 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextStroke: "0.5px rgba(0,0,0,0.1)",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)"
              }}>eLMS</div>
            <div className="text-[8px] mt-1 opacity-70 text-white">LEARNING. MASTERY. SUCCESS.</div>
          </div>

          {/* Decorative embossed lines on cover */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[70%] h-[1px] opacity-60"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              boxShadow: "0 0.5px 0.5px rgba(0,0,0,0.2)"
            }}
            role="presentation"
            aria-hidden="true" />
          <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[70%] h-[1px] opacity-60"
            style={{
              // background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              boxShadow: "0 0.5px 0.5px rgba(0,0,0,0.2)"
            }}
            role="presentation"
            aria-hidden="true" />

          {/* Decorative corner elements - golden corners */}
          {[
            "top-2 left-2", "top-2 right-2",
            "bottom-2 left-2", "bottom-2 right-2"
          ].map((position, i) => (
            <div key={i} className={`absolute w-4 h-4 ${position}`}
              style={{
                background: "linear-gradient(135deg, #f7e373 0%, #e6a417 100%)",
                opacity: 0.8,
                clipPath: i < 2 ? "polygon(0 0, 40% 0, 0 40%)" : i === 2 ? "polygon(0 100%, 0 60%, 40% 100%)" : "polygon(100% 100%, 60% 100%, 100% 60%)"
              }} />
          ))}

          {/* Book spine effect with embossed line */}
          <div className="absolute bottom-0 left-0 h-28 w-3 rounded-l-lg loaderBgColor"
            style={{
              // background: "linear-gradient(to right, #3730a3, #4338ca)",
              boxShadow: "inset -1px 0 1px rgba(0,0,0,0.3)"
            }}
            role="presentation"
            aria-hidden="true">
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-20 w-[1px]"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)"
              }} />
          </div>

          {/* Pages block side edge */}
          <div className="absolute bottom-1 right-1 h-28 w-2 rounded-r-sm"
            style={{
              background: "linear-gradient(to left, #e5e7eb, white)",
              backgroundImage: `
                   linear-gradient(to left, #e5e7eb, white),
                   repeating-linear-gradient(0deg, rgba(220,220,220,0.8) 0px, white 1px, white 2px, rgba(220,220,220,0.8) 3px)
                 `,
              boxShadow: "inset 0 0 3px rgba(0,0,0,0.1)"
            }}
            role="presentation"
            aria-hidden="true" />

          {/* Book pages - static left side with texture */}
          <div className="absolute bottom-1 left-3 h-28 w-[45%] rounded-r-sm"
            style={{
              background: "linear-gradient(to right, #f9fafb 70%, #f3f4f6 100%)",
              boxShadow: "inset -2px 0 3px rgba(0,0,0,0.05)",
              backgroundImage: `
                   linear-gradient(to right, #f9fafb 70%, #f3f4f6 100%),
                   url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")
                 `
            }}
            role="presentation"
            aria-hidden="true">
            {/* Left side page numbers */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute right-3 text-[10px] text-gray-400"
                style={{ bottom: `${i * 12 + 5}px` }}
              >{(i + 1) * 2 - 1}</div>
            ))}
          </div>

          {/* Turning pages with curl effect */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-1 right-1 h-28 w-[45%] rounded-l-sm origin-left"
              style={{
                transformStyle: "preserve-3d",
                zIndex: 10 - i,
                animation: `page-turn-curl 4s infinite ${i * 0.5}s cubic-bezier(0.3, 0.1, 0.3, 1.0)`,
                background: "linear-gradient(to left, #ffffff 85%, #f3f4f6 100%)",
                boxShadow: "0 0 3px rgba(0,0,0,0.1)",
                backgroundImage: `
                  linear-gradient(to left, #ffffff 85%, #f3f4f6 100%),
                  url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")
                `
              }}
              role="presentation"
              aria-hidden="true"
            >
              {/* Page number */}
              <div
                className="absolute left-3 bottom-2 text-[10px] text-gray-400"
                style={{
                  opacity: i === 0 ? 1 : 0.7 - (i * 0.1),
                }}
              >{(i + 1) * 2}</div>

              {/* Page content lines with varying lengths */}
              {[...Array(8)].map((_, j) => {
                const width = Math.random() * 10 + 65; // Random line width
                return (
                  <div
                    key={j}
                    className="absolute h-[1px] opacity-80 left-[12%]"
                    style={{
                      top: `${j * 5 + 5}px`,
                      width: `${width}%`,
                      background: "linear-gradient(90deg, rgba(160,160,160,0.6) 0%, rgba(160,160,160,0.3) 80%, rgba(160,160,160,0) 100%)"
                    }}
                  />
                );
              })}

              {/* Curl effect overlay */}
              <div
                className="absolute inset-0 rounded-l-sm overflow-hidden"
                style={{
                  background: "linear-gradient(to bottom right, transparent 75%, rgba(0,0,0,0.05) 85%, rgba(0,0,0,0.08) 95%)",
                  mixBlendMode: "multiply"
                }}
              />
            </div>
          ))}

          {/* Floating particles around the book for magical effect */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                bottom: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                background: "rgb(99, 102, 241)",
                boxShadow: "0 0 3px rgba(99, 102, 241, 0.6)",
                transform: "translateZ(0)",
              }}
            />
          ))}

          {/* Advanced animation keyframes */}
          <style jsx>{`
            @keyframes page-turn-curl {
              0%, 5% {
                transform: rotateY(0deg) translateZ(0px);
                filter: drop-shadow(-5px 2px 3px rgba(0,0,0,0.05));
              }
              40%, 45% {
                transform: rotateY(-170deg) translateZ(2px) scale(0.98);
                filter: drop-shadow(5px 3px 5px rgba(0,0,0,0.1));
              }
              85%, 100% {
                transform: rotateY(-360deg) translateZ(0px);
                filter: drop-shadow(-5px 2px 3px rgba(0,0,0,0.05));
              }
            }
            
            @keyframes pulse-glow {
              0% {
                opacity: 0.6;
                transform: scale(0.95);
              }
              100% {
                opacity: 0.8;
                transform: scale(1.05);
              }
            }
            
            @keyframes shimmer {
              0% {
                transform: translateX(-150%) translateY(-150%) rotate(45deg);
              }
              100% {
                transform: translateX(150%) translateY(150%) rotate(45deg);
              }
            }
            
            .perspective-1200 {
              perspective: 1200px;
            }
          `}</style>
        </div>

        {/* Logo text */}
        <div className="text-3xl font-bold loaderColor mt-4">
          {process.env.NEXT_PUBLIC_WEB_NAME || 'eLMS'}
        </div>
      </div>
    </div>
  )
}

export default MainLoader

"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import type { SystemConfig } from "@/types/models";

const SystemConfigContext = createContext<SystemConfig | null>(null);

function makeCircularFavicon(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (
      imageUrl.includes("res.cloudinary.com") &&
      imageUrl.includes("/upload/")
    ) {
      const transformedUrl = imageUrl.replace(
        "/upload/",
        "/upload/c_fill,g_auto,w_128,h_128,r_max,f_png/"
      );
      return resolve(transformedUrl);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 128;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(imageUrl);

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

export function SystemConfigProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: SystemConfig | null;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && value?.systemLogoUrl) {
      makeCircularFavicon(value.systemLogoUrl).then((circularUrl) => {
        let link: HTMLLinkElement | null = document.querySelector(
          "link[rel*='icon']"
        );
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.type = "image/png";
        link.href = circularUrl;
      });
    }
  }, [value?.systemLogoUrl]);

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  const context = useContext(SystemConfigContext);
  return context;
}

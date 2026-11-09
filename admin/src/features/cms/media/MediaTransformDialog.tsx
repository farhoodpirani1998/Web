import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import { ApiError } from "@/lib/apiError";

import { uploadMedia } from "./api";
import { setCachedMedia } from "./mediaCache";
import type { CmsMedia } from "./types";

type Crop = { x: number; y: number; width: number; height: number };
type AspectRatio = "free" | "1:1" | "4:3" | "16:9";

const MAX_OUTPUT_DIMENSION = 8192;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function centeredCrop(
  aspect: Exclude<AspectRatio, "free">,
  width: number,
  height: number,
): Crop {
  const [aspectWidth, aspectHeight] = aspect.split(":").map(Number);
  const targetRatio = aspectWidth / aspectHeight;
  const imageRatio = width / height;
  let cropWidth = 1;
  let cropHeight = 1;

  if (imageRatio > targetRatio) {
    cropWidth = (height * targetRatio) / width;
  } else {
    cropHeight = width / targetRatio / height;
  }

  return {
    x: (1 - cropWidth) / 2,
    y: (1 - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

function pointInImage(event: PointerEvent<HTMLDivElement>): { x: number; y: number } {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
  };
}

export interface MediaTransformDialogProps {
  media: CmsMedia;
  onCancel: () => void;
  onTransformed: (media: CmsMedia) => void;
}

export function MediaTransformDialog({
  media,
  onCancel,
  onTransformed,
}: MediaTransformDialogProps) {
  const widthId = useId();
  const selectionStart = useRef<{ x: number; y: number } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 1, height: 1 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [outputWidth, setOutputWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function loadImage() {
      try {
        const response = await fetch(media.url, { credentials: "same-origin" });
        if (!response.ok) throw new Error("بارگیری تصویر از سرور ناموفق بود.");
        const blob = await response.blob();
        if (!MIME_EXTENSIONS[blob.type]) {
          throw new Error("قالب این تصویر برای ویرایش پشتیبانی نمی‌شود.");
        }
        objectUrl = URL.createObjectURL(blob);
        if (active) {
          setImageUrl(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (active) {
          setError("تصویر بارگیری نشد. اتصال سرور و دسترسی فایل را بررسی کنید.");
          setIsLoading(false);
        }
      }
    }

    void loadImage();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media.url]);

  const cropWidth = imageSize ? Math.max(1, Math.round(crop.width * imageSize.width)) : 0;
  const cropHeight = imageSize
    ? Math.max(1, Math.round(crop.height * imageSize.height))
    : 0;
  const outputHeight =
    cropWidth > 0 ? Math.max(1, Math.round((outputWidth * cropHeight) / cropWidth)) : 0;
  const canSave =
    Boolean(imageUrl && imageSize) &&
    outputWidth > 0 &&
    outputWidth <= MAX_OUTPUT_DIMENSION &&
    outputHeight <= MAX_OUTPUT_DIMENSION &&
    !isSaving;

  function handleImageLoaded(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setImageSize({ width: naturalWidth, height: naturalHeight });
    setOutputWidth(naturalWidth);
    setIsLoading(false);
  }

  function handleAspectRatioChange(value: AspectRatio) {
    setAspectRatio(value);
    if (value === "free") {
      setCrop({ x: 0, y: 0, width: 1, height: 1 });
      if (imageSize) setOutputWidth(imageSize.width);
    } else if (imageSize) {
      const nextCrop = centeredCrop(value, imageSize.width, imageSize.height);
      setCrop(nextCrop);
      setOutputWidth(Math.max(1, Math.round(nextCrop.width * imageSize.width)));
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isSaving || !imageSize) return;
    const point = pointInImage(event);
    selectionStart.current = point;
    setAspectRatio("free");
    setCrop({ x: point.x, y: point.y, width: 0, height: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = selectionStart.current;
    if (!start || !imageSize) return;
    const point = pointInImage(event);
    const x = Math.min(start.x, point.x);
    const y = Math.min(start.y, point.y);
    const width = Math.abs(point.x - start.x);
    const height = Math.abs(point.y - start.y);
    if (width > 0.005 && height > 0.005) {
      const nextCrop = { x, y, width, height };
      setCrop(nextCrop);
      setOutputWidth(Math.max(1, Math.round(nextCrop.width * imageSize.width)));
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    selectionStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function handleSave() {
    if (!canSave || !imageUrl || !imageSize) return;

    setError(null);
    setIsSaving(true);
    try {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("مرورگر امکان ویرایش تصویر را فراهم نکرد.");

      context.drawImage(
        image,
        crop.x * imageSize.width,
        crop.y * imageSize.height,
        crop.width * imageSize.width,
        crop.height * imageSize.height,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("ساخت فایل ویرایش‌شده ناموفق بود.")),
          media.mimeType,
          0.92,
        );
      });
      const extension = MIME_EXTENSIONS[blob.type];
      if (!extension) throw new Error("قالب خروجی تصویر پشتیبانی نمی‌شود.");

      const file = new File([blob], `edited-image.${extension}`, { type: blob.type });
      const transformed = await uploadMedia(
        { file, altText: media.altText },
        setProgress,
      );
      setCachedMedia(transformed);
      onTransformed(transformed);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "ویرایش یا بارگذاری تصویر ناموفق بود.",
      );
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
      <div className="my-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">برش و تغییر اندازه تصویر</h2>
        <p className="mt-1 text-sm text-slate-500">
          برای انتخاب محدوده، روی تصویر بکشید. فایل اصلی و استفاده‌های فعلی آن حفظ می‌شوند
          و نتیجه به‌صورت رسانه‌ای جدید ذخیره خواهد شد.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-900">
            نسبت برش
            <select
              value={aspectRatio}
              onChange={(event) =>
                handleAspectRatioChange(event.target.value as AspectRatio)
              }
              disabled={isLoading || isSaving}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="free">آزاد / کل تصویر</option>
              <option value="1:1">مربع (۱:۱)</option>
              <option value="4:3">۴:۳</option>
              <option value="16:9">۱۶:۹</option>
            </select>
          </label>

          <label
            htmlFor={widthId}
            className="flex flex-col gap-1.5 text-sm font-medium text-slate-900"
          >
            عرض خروجی (پیکسل)
            <input
              id={widthId}
              type="number"
              min={1}
              max={MAX_OUTPUT_DIMENSION}
              value={outputWidth || ""}
              onChange={(event) => setOutputWidth(Number(event.target.value))}
              disabled={isLoading || isSaving}
              className="w-40 rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <p className="pb-2 text-sm text-slate-600">
            ارتفاع خروجی: {outputHeight || "—"} پیکسل
          </p>
        </div>

        {outputWidth > MAX_OUTPUT_DIMENSION || outputHeight > MAX_OUTPUT_DIMENSION ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            ابعاد خروجی نمی‌تواند بیشتر از {MAX_OUTPUT_DIMENSION} پیکسل باشد.
          </p>
        ) : null}

        <div className="mt-4 flex min-h-48 items-center justify-center overflow-hidden rounded-md bg-slate-100 p-3">
          {imageUrl ? (
            <div
              className="relative mx-auto w-fit max-w-full cursor-crosshair touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              aria-label="برای انتخاب محدودهٔ برش روی تصویر بکشید"
            >
              <img
                src={imageUrl}
                alt={media.altText}
                onLoad={handleImageLoaded}
                className="block max-h-80 max-w-full"
                draggable={false}
              />
              {crop.width < 1 || crop.height < 1 ? null : (
                <div
                  className="pointer-events-none absolute border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]"
                  style={{
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.width * 100}%`,
                    height: `${crop.height * 100}%`,
                  }}
                />
              )}
            </div>
          ) : isLoading ? (
            <p className="text-sm text-slate-500">در حال بارگیری تصویر…</p>
          ) : null}
        </div>

        {isSaving ? (
          <div className="mt-3 flex flex-col gap-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">در حال بارگذاری… {progress}%</p>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "در حال ذخیره…" : "ذخیره نسخهٔ جدید"}
          </button>
        </div>
      </div>
    </div>
  );
}

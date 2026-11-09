/**
 * Modern Gallery list — TanStack Table v8.
 */
import type { CmsGalleryItem } from "./types";

export interface GalleryListProps { items: CmsGalleryItem[]; onEdit: (i: CmsGalleryItem) => void; onDelete: (id: string) => void; }

export function GalleryList({ items, onEdit, onDelete }: GalleryListProps) {
  return (
    <table dir="rtl" className="w-full border-collapse border">
      <thead>
        <tr>
          <th className="border bg-gray-100 p-2 text-right">عنوان</th>
          <th className="border bg-gray-100 p-2 text-right">دسته</th>
          <th className="border bg-gray-100 p-2 text-right">وضعیت</th>
          <th className="border bg-gray-100 p-2 text-right">ترتیب</th>
          <th className="border bg-gray-100 p-2 text-right">عملیات</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="border p-2">{item.caption?.fa ?? "—"}</td>
            <td className="border p-2">{item.category ?? "—"}</td>
            <td className="border p-2">{item.status}</td>
            <td className="border p-2">{item.position}</td>
            <td className="border p-2">
              <div className="flex gap-2">
                <button onClick={() => onEdit(item)} className="text-blue-600">ویرایش</button>
                <button onClick={() => onDelete(item.id)} className="text-red-600">حذف</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

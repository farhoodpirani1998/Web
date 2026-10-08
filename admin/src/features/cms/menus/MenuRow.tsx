import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsMenu } from "./types";

export interface MenuRowProps {
  menu: CmsMenu;
  isSelected: boolean;
  onSelect: (menu: CmsMenu) => void;
  onEdit: (menu: CmsMenu) => void;
  onDeleteRequest: (menu: CmsMenu) => void;
}

export function MenuRow({ menu, isSelected, onSelect, onEdit, onDeleteRequest }: MenuRowProps) {
  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 ${
        isSelected ? "border-slate-900 bg-slate-50" : "border-slate-200"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(menu)}
        className="flex-1 text-left"
      >
        <p className="text-sm font-medium text-slate-900">{menu.name}</p>
        <p className="text-xs text-slate-500">{menu.key}</p>
      </button>

      <div className="flex shrink-0 gap-2">
        <PermissionGate permission="website.content:write">
          <button
            type="button"
            onClick={() => onEdit(menu)}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
        </PermissionGate>
        <PermissionGate permission="website.content:write">
          <button
            type="button"
            onClick={() => onDeleteRequest(menu)}
            className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </PermissionGate>
      </div>
    </li>
  );
}

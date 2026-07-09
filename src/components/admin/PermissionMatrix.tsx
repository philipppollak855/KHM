"use client";

import type { PermissionModule, TeamPermissions } from "@/lib/types";
import {
  PERMISSION_MODULE_DEFS,
  createEmptyPermissions,
  normalizePermissions,
} from "@/lib/permissions";

export default function PermissionMatrix({
  value,
  onChange,
  disabled,
}: {
  value: TeamPermissions;
  onChange: (next: TeamPermissions) => void;
  disabled?: boolean;
}) {
  const permissions = normalizePermissions(value);

  const setPerm = (
    module: Exclude<PermissionModule, "team">,
    field: "read" | "write",
    checked: boolean
  ) => {
    const next = normalizePermissions(permissions);
    const current = next[module];
    if (field === "read") {
      current.read = checked;
      if (!checked) current.write = false;
    } else {
      current.write = checked;
      if (checked) current.read = true;
    }
    onChange(next);
  };

  return (
    <div className="overflow-x-auto border border-wood/10 rounded-xl bg-white">
      <table className="w-full text-sm min-w-[28rem]">
        <thead className="bg-wood/5 text-xs uppercase tracking-wide text-stone">
          <tr>
            <th className="text-left p-3 font-medium">Modul</th>
            <th className="p-3 font-medium w-24 text-center">Lesen</th>
            <th className="p-3 font-medium w-24 text-center">Schreiben</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood/10">
          {PERMISSION_MODULE_DEFS.filter((m) => !m.ownerOnly).map((module) => {
            const perm = permissions[module.id as Exclude<PermissionModule, "team">];
            return (
              <tr key={module.id}>
                <td className="p-3">
                  <p className="font-medium text-wood-dark">{module.label}</p>
                  <p className="text-xs text-stone mt-0.5">{module.description}</p>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={perm.read}
                    disabled={disabled}
                    onChange={(e) =>
                      setPerm(
                        module.id as Exclude<PermissionModule, "team">,
                        "read",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 accent-forest"
                    aria-label={`${module.label} lesen`}
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={perm.write}
                    disabled={disabled || !perm.read}
                    onChange={(e) =>
                      setPerm(
                        module.id as Exclude<PermissionModule, "team">,
                        "write",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 accent-forest"
                    aria-label={`${module.label} schreiben`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { createEmptyPermissions };

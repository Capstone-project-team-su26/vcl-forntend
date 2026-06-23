"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useState } from "react";
import * as authService from "@/utils/authService";
import { ApiError } from "@/utils/apiError";
import { getErrorMessage } from "@/utils/apiError";
const EMPLOYEE_ROLES = [
  { value: "Sale", label: "Sale" },
  { value: "WarehouseStaff", label: "Warehouse Staff" },
  { value: "OperationsManager", label: "Operations Manager" },
  { value: "Delivery", label: "Delivery" },
  { value: "Admin", label: "Admin" }
];
function getInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}
function CreateUserModal({ open, onClose, onCreated }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!open) return null;
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const phone = form.phone.value.trim();
    const role = form.employeeRole.value;
    setIsSubmitting(true);
    try {
      const response = await authService.adminRegisterEmployee({
        fullName,
        email,
        password,
        phone,
        role
      });
      onCreated({
        id: response.id,
        name: fullName,
        email,
        role,
        status: "ACTIVE",
        lastSeen: "V\u1EEBa t\u1EA1o",
        avatar: getInitials(fullName)
      });
      form.reset();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("B\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n t\u1EA1o ng\u01B0\u1EDDi d\xF9ng.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "absolute inset-0 bg-black/40",
        "aria-label": "\u0110\xF3ng",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg bg-surface-elevated rounded-2xl border border-border-muted shadow-xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink", children: "Th\xEAm nh\xE2n vi\xEAn" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mt-1", children: "T\u1EA1o t\xE0i kho\u1EA3n nh\xE2n vi\xEAn m\u1EDBi qua API admin." })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "p-2 text-muted hover:text-ink", children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:x", className: "w-5 h-5" }) })
      ] }),
      error ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
      /* @__PURE__ */ jsxs(
        "form",
        {
          className: "space-y-4",
          onSubmit: handleSubmit,
          onInput: () => {
            if (error) setError("");
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "fullName", className: "text-sm font-semibold text-ink", children: "H\u1ECD t\xEAn" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "fullName",
                  name: "fullName",
                  required: true,
                  className: "w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-sm font-semibold text-ink", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "email",
                  name: "email",
                  type: "email",
                  required: true,
                  className: "w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "text-sm font-semibold text-ink", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "phone",
                    name: "phone",
                    required: true,
                    className: "w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "employeeRole", className: "text-sm font-semibold text-ink", children: "Vai tr\xF2" }),
                /* @__PURE__ */ jsx(
                  "select",
                  {
                    id: "employeeRole",
                    name: "employeeRole",
                    required: true,
                    defaultValue: "Sale",
                    className: "w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring bg-surface-elevated",
                    children: EMPLOYEE_ROLES.map((item) => /* @__PURE__ */ jsx("option", { value: item.value, children: item.label }, item.value))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-sm font-semibold text-ink", children: "M\u1EADt kh\u1EA9u" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password",
                  name: "password",
                  type: "password",
                  required: true,
                  minLength: 8,
                  maxLength: 100,
                  className: "w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  className: "h-11 px-4 rounded-lg text-sm font-semibold text-muted hover:bg-surface",
                  children: "H\u1EE7y"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: isSubmitting,
                  className: "h-11 px-5 rounded-lg text-sm font-bold bg-insight text-white hover:bg-secondary disabled:opacity-60",
                  children: isSubmitting ? "\u0110ang t\u1EA1o..." : "T\u1EA1o t\xE0i kho\u1EA3n"
                }
              )
            ] })
          ]
        }
      )
    ] })
  ] });
}
export {
  CreateUserModal as default
};

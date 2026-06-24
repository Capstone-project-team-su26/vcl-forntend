"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import CreateUserModal from "./CreateUserModal";
import * as userService from "@/utils/userService";
import { getErrorMessage } from "@/utils/apiError";
const initialUsers = [];
function RoleBadge({ role }) {
  return /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1 rounded-md text-[11px] font-bold tracking-wide bg-info-bg text-info-text", children: role });
}
function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-success-bg text-success-text",
    LOCKED: "bg-danger/10 text-danger"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-block px-3 py-1 rounded-full text-[11px] font-bold ${styles[status]}`, children: status === "ACTIVE" ? "ACTIVE" : "LOCKED" });
}
function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  useEffect(() => {
    let active = true;
    userService.listUsers().then((data) => {
      if (active) setUsers(data);
    }).catch((error) => {
      if (active) setActionError(getErrorMessage(error));
    }).finally(() => {
      if (active) setIsLoadingUsers(false);
    });
    return () => {
      active = false;
    };
  }, []);
  async function handleLockToggle(user) {
    setActionError("");
    setActionMessage("");
    setPendingUserId(user.id);
    setOpenMenuId(null);
    try {
      if (user.status === "ACTIVE") {
        const response = await userService.lockUser(user.id);
        setUsers(
          (current) => current.map(
            (item) => item.id === user.id ? { ...item, status: "LOCKED", lastSeen: "\u0110\xE3 kh\xF3a" } : item
          )
        );
        setActionMessage(response?.message || "Kh\xF3a t\xE0i kho\u1EA3n th\xE0nh c\xF4ng.");
      } else {
        const response = await userService.unlockUser(user.id);
        setUsers(
          (current) => current.map(
            (item) => item.id === user.id ? { ...item, status: "ACTIVE", lastSeen: "V\u1EEBa m\u1EDF kh\xF3a" } : item
          )
        );
        setActionMessage(response?.message || "M\u1EDF kh\xF3a t\xE0i kho\u1EA3n th\xE0nh c\xF4ng.");
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingUserId(null);
    }
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { activeNav: "users", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-ink tracking-tight", children: "Qu\u1EA3n l\xFD ng\u01B0\u1EDDi d\xF9ng" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mt-1 max-w-xl", children: "T\u1EA1o nh\xE2n vi\xEAn v\xE0 kh\xF3a/m\u1EDF kh\xF3a t\xE0i kho\u1EA3n qua API backend. Backend ch\u01B0a c\xF3 API danh s\xE1ch ng\u01B0\u1EDDi d\xF9ng." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsCreateOpen(true),
            className: "inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0",
            children: [
              /* @__PURE__ */ jsx(Icon, { icon: "lucide:user-plus", className: "w-4 h-4" }),
              "Th\xEAm ng\u01B0\u1EDDi d\xF9ng"
            ]
          }
        )
      ] }),
      actionError ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: actionError }) : null,
      actionMessage ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: actionMessage }) : null,
      /* @__PURE__ */ jsx("div", { className: "bg-surface-elevated rounded-xl border border-border-muted shadow-sm overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[800px] text-left", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border-muted bg-surface", children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Ng\u01B0\u1EDDi d\xF9ng" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Vai tr\xF2" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "Tr\u1EA1ng th\xE1i" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider", children: "L\u1EA7n cu\u1ED1i" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider text-right", children: "H\xE0nh \u0111\u1ED9ng" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border-muted", children: isLoadingUsers ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-sm text-muted", children: "\u0110ang t\u1EA3i danh s\xE1ch ng\u01B0\u1EDDi d\xF9ng..." }) }) : users.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-12 text-center text-sm text-muted", children: 'Ch\u01B0a c\xF3 ng\u01B0\u1EDDi d\xF9ng trong phi\xEAn n\xE0y. Nh\u1EA5n "Th\xEAm ng\u01B0\u1EDDi d\xF9ng" \u0111\u1EC3 t\u1EA1o nh\xE2n vi\xEAn m\u1EDBi.' }) }) : users.map((user) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-surface/80 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center text-xs font-bold text-insight shrink-0", children: user.avatar }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-ink", children: user.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted", children: user.email }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-faint mt-0.5", children: user.id })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(RoleBadge, { role: user.role }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(StatusBadge, { status: user.status }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-muted", children: user.lastSeen }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-right relative", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setOpenMenuId((current) => current === user.id ? null : user.id),
                className: "p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors",
                "aria-label": "T\xF9y ch\u1ECDn",
                children: /* @__PURE__ */ jsx(Icon, { icon: "lucide:more-horizontal", className: "w-5 h-5" })
              }
            ),
            openMenuId === user.id ? /* @__PURE__ */ jsx("div", { className: "absolute right-6 top-12 z-20 w-44 rounded-xl border border-border-muted bg-surface-elevated shadow-lg py-2 text-left", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                disabled: pendingUserId === user.id,
                onClick: () => handleLockToggle(user),
                className: "w-full px-4 py-2.5 text-sm font-semibold text-left hover:bg-surface disabled:opacity-50",
                children: pendingUserId === user.id ? "\u0110ang x\u1EED l\xFD..." : user.status === "ACTIVE" ? "Kh\xF3a t\xE0i kho\u1EA3n" : "M\u1EDF kh\xF3a t\xE0i kho\u1EA3n"
              }
            ) }) : null
          ] })
        ] }, user.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(
      CreateUserModal,
      {
        open: isCreateOpen,
        onClose: () => setIsCreateOpen(false),
        onCreated: (user) => {
          setUsers((current) => [user, ...current]);
          setActionMessage("T\u1EA1o t\xE0i kho\u1EA3n nh\xE2n vi\xEAn th\xE0nh c\xF4ng.");
        }
      }
    )
  ] });
}
export {
  UserManagementPage as default
};

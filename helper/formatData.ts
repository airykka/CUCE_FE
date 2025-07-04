import { format } from "date-fns";
import type {
  FormattedInvitee,
  FormattedRegistrar,
  Invitee,
  Registrar,
} from "~/types/format";

export function getRegistrarStatus(
  isSuspended: boolean,
  isDeactivated: boolean
): string {
  if (isDeactivated) return "Deactivated";
  if (isSuspended) return "Suspended";
  return "Active";
}

export function formatRegistrars(
  rawRegistrars: Registrar[]
): FormattedRegistrar[] {
  return rawRegistrars.map((r) => ({
    id: r.registrar_id,
    name: `${r.first_name} ${r.last_name}`,
    email: r.email,
    avatar:
      r.profile_picture || "https://randomuser.me/api/portraits/men/44.jpg",
    status: getRegistrarStatus(r.is_suspended, r.is_deactivated),
    enrollRequests: r.stats?.totalEnrollments || 0,
    approvals: r.stats?.approvedEnrollments || 0,
    denials: r.stats?.rejectedEnrollments || 0,
  }));
}

export function formatInvitees(rawInvites: Invitee[]): FormattedInvitee[] {
  return rawInvites
    .filter(
      (invite) =>
        invite.status === "PENDING" && invite.user_type === "REGISTRAR"
    )
    .map((invite) => ({
      id: invite.invitation_id,
      email: invite.email,
      date: format(new Date(invite.created_at), "do MMM, yyyy"),
    }));
}

export const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "status-active";
    case "pending":
      return "status-suspended";
    case "rejected":
      return "status-deactivated";
    default:
      return "";
  }
};

export const capitalizeFirst = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export function formatDateToDMY(dateString: string | number | Date) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/permissions";

// Minimal user list for the reports "Submitted by" filter. Only requires
// reports:view (unlike /api/users, which is gated on users:manage) and never
// exposes emails, passwords, or roles.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.permissions, "reports:view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const res = await pool.query(
      "SELECT id, name FROM users WHERE id IN (SELECT DISTINCT user_id FROM complaints WHERE user_id IS NOT NULL) ORDER BY name ASC"
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching users" + error }, { status: 500 });
  }
}

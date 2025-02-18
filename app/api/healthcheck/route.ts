import { db } from "@/lib/db/drizzle";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Test database connection
		await db.execute(sql`SELECT 1`);

		return new NextResponse("OK", {
			status: 200,
		});
	} catch (error) {
		return new NextResponse("ERROR", {
			status: 500,
		});
	}
}

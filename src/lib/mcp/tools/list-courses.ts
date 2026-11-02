import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_courses",
  title: "List courses",
  description: "List the published Pathway Pro aviation training programmes with fees and duration.",
  inputSchema: {
    search: z.string().optional().describe("Optional text to match against course titles."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search }) => {
    const supabase = supabaseAnon();
    let query = supabase.from("courses").select("*").limit(50);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { courses: data ?? [] },
    };
  },
});

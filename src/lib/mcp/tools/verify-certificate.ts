import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "verify_certificate",
  title: "Verify certificate",
  description: "Check whether a Pathway Pro graduation certificate number is valid.",
  inputSchema: {
    certificate_number: z.string().trim().describe("The certificate number printed on the document."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ certificate_number }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .ilike("certificate_number", certificate_number)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return {
        content: [{ type: "text", text: "No certificate found with that number." }],
        structuredContent: { found: false },
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { found: true, certificate: data },
    };
  },
});

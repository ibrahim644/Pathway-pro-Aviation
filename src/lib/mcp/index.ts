import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCourses from "./tools/list-courses";
import verifyCertificate from "./tools/verify-certificate";
import listMyApplications from "./tools/list-my-applications";
import getMyApplication from "./tools/get-my-application";
import listMyPayments from "./tools/list-my-payments";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "aviation-pathway-portal",
  title: "Aviation Pathway Portal",
  version: "0.1.0",
  instructions:
    "Tools for the Pathway Pro Aviation Training portal. Use `list_courses` and `verify_certificate` for public programme and certificate data, and `list_my_applications`, `get_my_application` and `list_my_payments` to read the signed-in applicant's own admission records.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCourses, verifyCertificate, listMyApplications, getMyApplication, listMyPayments] as never,
});

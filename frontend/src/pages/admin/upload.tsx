import { Redirect } from "wouter";

// Redirect /admin/upload to /admin/statements since upload is part of that page
export default function AdminUploadPage() {
  return <Redirect to="/admin/statements" />;
}

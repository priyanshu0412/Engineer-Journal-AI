import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { MOCK_MODE } from "@/lib/config";

export default function SignUpPage() {
  if (MOCK_MODE) redirect("/dashboard");
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <SignUp />
    </div>
  );
}

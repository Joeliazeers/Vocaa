import { AuthForm } from "../AuthForm";
import { registerAction } from "../actions";

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
      <p className="mb-6 text-sm text-ink-500">Start your language journey in minutes.</p>
      <AuthForm mode="register" action={registerAction} />
    </>
  );
}

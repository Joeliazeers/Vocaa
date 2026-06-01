import { AuthForm } from "../AuthForm";
import { loginAction } from "../actions";

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-ink-500">Log in to continue learning.</p>
      <AuthForm mode="login" action={loginAction} />
    </>
  );
}

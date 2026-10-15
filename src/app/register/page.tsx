import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="auth-layout">
      <section className="auth-aside">
        <Link className="wordmark wordmark-light" href="/"><span className="wordmark-mark">S</span>SkillPilot</Link>
        <p>Make room for a new skill.</p>
        <h1>Small steps.<br />New directions.</h1>
        <span className="aside-line" />
        <p className="aside-small">Create your free student account and begin at your own pace.</p>
      </section>
      <section className="auth-main">
        <div className="auth-panel">
          <p className="eyebrow">Start learning</p>
          <h2>Create an account</h2>
          <p className="auth-description">A little curiosity can take you a long way.</p>
          <AuthForm mode="register" />
        </div>
      </section>
    </div>
  );
}

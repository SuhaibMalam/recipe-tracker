import { requireUser } from "@/lib/session";
import { isDemoUser } from "@/lib/demo";
import ProfileForm from "@/components/settings/ProfileForm";
import PasswordForm from "@/components/settings/PasswordForm";
import DeleteAccountForm from "@/components/settings/DeleteAccountForm";

export const metadata = { title: "Settings" };

function Section({ id, title, description, children }) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-6 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr]"
    >
      <div>
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="mt-2 text-ink-muted">Signed in as {user.email}.</p>

      {isDemoUser(user) ? (
        <p className="card mt-8 p-5 text-sm text-ink-muted">
          This is the shared demo account, so its name and password can&apos;t be changed and it
          can&apos;t be deleted. Create your own account to try settings.
        </p>
      ) : (
        <div className="card mt-8 p-6 sm:p-8">
          <Section id="profile-heading" title="Profile" description="How we greet you.">
            <ProfileForm name={user.name} />
          </Section>
          <Section
            id="password-heading"
            title="Password"
            description="Changing it signs you out everywhere else."
          >
            <PasswordForm />
          </Section>
          <Section
            id="delete-heading"
            title="Delete account"
            description="Removes your account, recipes and food log. This can't be undone."
          >
            <DeleteAccountForm />
          </Section>
        </div>
      )}
    </>
  );
}

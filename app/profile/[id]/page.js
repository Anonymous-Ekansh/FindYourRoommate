import ProfileDetail from "@/components/ProfileDetail/ProfileDetail";

export default async function ProfilePage({ params }) {
  const { id } = await params;
  return (
    <main>
      <ProfileDetail profileId={id} />
    </main>
  );
}

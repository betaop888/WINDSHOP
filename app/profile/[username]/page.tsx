import { ProfilePage } from "@/components/profile/ProfilePage";

type ProfileRouteProps = {
  params: {
    username: string;
  };
};

export default function ProfileRoutePage({ params }: ProfileRouteProps) {
  return <ProfilePage username={params.username} />;
}

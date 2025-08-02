import { Metadata } from "next";
import { UserProfile } from "@/components/profile/user-profile";

export const metadata: Metadata = {
  title: "User Profile | FileThetic",
  description: "View and manage your profile on the FileThetic platform",
};

export default function ProfilePage() {
  return (
      <div className="container max-w-7xl mx-auto py-6 md:py-10">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
              <p className="text-muted-foreground">
                View and manage your profile on the FileThetic platform
              </p>
            </div>
          </div>
          
          <UserProfile />
        </div>
      </div>
  );
}

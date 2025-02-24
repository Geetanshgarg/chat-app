import UserSearch from "@/components/UserSearch";
import MainNavbar from '@/components/MainNavbar';
import SidebarUse from "@/components/sidebarIntegrate";

export default function SearchPage() {
  return (
    <SidebarUse>
      <div className="h-screen flex flex-col bg-white dark:bg-zinc-950">
        <div className="flex-1 flex">
          <main className="flex-1 bg-gray-50/50 dark:bg-zinc-950 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-4 sm:mb-8">Find Friends</h1>
              <UserSearch />
            </div>
          </main>
        </div>
      </div>
    </SidebarUse>
  );
}
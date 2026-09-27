import { CitrusIcon } from "lucide-react";
import { navigation } from "../config/navigation";
import { NavLink } from "./nav-link";

/** Full sidebar on desktop, icon rail on tablets, hidden on phones. */
export function Sidebar() {
  return (
    <aside className="bg-card no-print sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 border-l p-3 md:flex md:w-24 lg:w-64 lg:p-4">
      <div className="flex items-center gap-3 px-2 pt-2 md:max-lg:justify-center">
        <div className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl">
          <CitrusIcon className="size-6" />
        </div>
        <span className="text-lg font-bold md:max-lg:hidden">میوه‌فروشی</span>
      </div>
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {navigation.map((section, i) => (
          <div key={i} className="flex flex-col gap-1">
            {section.title && (
              <p className="text-muted-foreground px-3 pb-1 text-xs md:max-lg:hidden">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink key={item.href} href={item.href} variant="sidebar" />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

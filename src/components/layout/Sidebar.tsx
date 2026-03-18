import { Zap, Clock, Image, LayoutDashboard } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  isOpen?: boolean;
}

const categories = [
  { id: 'quick-snacks', name: 'Quick Snacks', icon: Zap },
  { id: 'pre-order', name: 'Pre Order', icon: Clock },
  { id: 'gallery', name: 'Gallery', icon: Image },
  { id: 'admin', name: 'Dashboard', icon: LayoutDashboard },
];

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory, isOpen }) => {
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-zinc-100 transition-transform lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:block",
      !isOpen && "-translate-x-full"
    )}>
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">Menu</h2>
        <div className="space-y-2 flex-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                activeCategory === cat.id 
                  ? "bg-orange-50 text-orange-600 shadow-sm" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <cat.icon className={cn("w-5 h-5", activeCategory === cat.id ? "text-orange-600" : "text-zinc-400")} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

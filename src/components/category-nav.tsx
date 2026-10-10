"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoryNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="পণ্যের বিভাগ" className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      <ul className="flex w-max items-center gap-1">
        {categories.map((category) => {
          const href = `/category/${category.slug}`;
          const active = pathname === href;
          return (
            <li key={category.slug}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-secondary text-primary-content"
                    : "text-base-content hover:bg-base-300"
                }`}
              >
                <span aria-hidden="true">{category.emoji}</span>
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}







// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import type { Category } from "@/lib/types";

// export function CategoryNav({ categories }: { categories: Category[] }) {
//   const pathname = usePathname();

//   return (
//     <nav aria-label="পণ্যের বিভাগ" className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
//       <ul className="flex w-max gap-1 sm:w-full sm:flex-wrap sm:justify-center">
//         {categories.map((category) => {
//           const href = `/category/${category.slug}`;
//           const active = pathname === href;
//           return (
//             <li key={category.slug}>
//               <Link
//                 href={href}
//                 aria-current={active ? "page" : undefined}
//                 className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
//                   active
//                     ? "bg-secondary text-primary-content"
//                     : "text-base-content hover:bg-base-300"
//                 }`}
//               >
//                 <span aria-hidden="true">{category.emoji}</span>
//                 {category.name}
//               </Link>
//             </li>
//           );
//         })}
//       </ul>
//     </nav>
//   );
// }

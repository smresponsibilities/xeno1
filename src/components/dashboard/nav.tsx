"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  LineChart,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/analytics", icon: LineChart, label: "Analytics" },
    { href: "/ingestion", icon: Database, label: "Data Ingestion" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

interface NavProps {
    isMobile?: boolean;
}

export function Nav({ isMobile = false }: NavProps) {
    const pathname = usePathname()

    return (
        <nav className={cn(
            "grid items-start px-2 text-sm font-medium lg:px-4",
            isMobile && "gap-4"
        )}>
            {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === href && "bg-muted text-primary"
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </Link>
            ))}
        </nav>
    )
}

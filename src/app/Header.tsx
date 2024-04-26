"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
        <RocketIcon className="h-8 w-8 text-primary" />
        <div className="ml-auto flex gap-2">
          {pathname !== "/" && (
            <Button
              variant="ghost"
              onClick={() => {
                router.push("/");
              }}
            >
              Switch Team
            </Button>
          )}
        </div>
      </header>
    </div>
  );
}

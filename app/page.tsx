import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiment 02 - Crafted.is",
};
import Chat from "@/components/chat";

export default function Page() {
  return (
    <div className="flex h-[calc(100vh)] bg-[hsl(240_5%_92.16%)] md:rounded-s-3xl md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
      <Chat />
    </div>
  );
}
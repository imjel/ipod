import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Body from "~/components/ipod/body";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <div className="flex items-center p-4 justify-center ">
  <Body />
  </div>;
}

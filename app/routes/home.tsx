import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Body from "~/components/ipod/body";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "iPod Nano" },
  ];
}

export default function Home() {
  return <div className="flex items-center p-4 justify-center ">
  <Body />
  </div>;
}

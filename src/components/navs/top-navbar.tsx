import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import LocaltySelector from "./localty-selector";
import { ModeToggle } from "./theme-toggler";
interface Props {}

const TopNavbar: NextPage<Props> = () => {
  return (
    <nav className="border-b border-slate-100 flex items-center justify-between px-4 h-[7svh] ">
      <Link href={"/"}>
        <h6 className="font-medium tracking-wider text-primary text-center uppercase ">
          Lawgic
        </h6>
      </Link>
      <LocaltySelector />
    </nav>
  );
};

export default TopNavbar;

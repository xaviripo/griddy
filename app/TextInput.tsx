import { ComponentPropsWithoutRef } from "react";

export default function TextInput(props: ComponentPropsWithoutRef<"input">) {
  return <input className="text-black m-2 py-1 px-2 rounded focus:outline-none" {...props} />;
}

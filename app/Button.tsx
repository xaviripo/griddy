import { ComponentPropsWithoutRef } from "react";

export default function Button(props: ComponentPropsWithoutRef<"button">) {
  return <button className="m-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded hover:cursor-pointer" {...props} />;
}

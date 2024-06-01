import { ReactNode, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAppDispatch } from "@/lib/hooks";
import { ManifestStatus, fetchManifest } from "@/lib/manifestSlice";
import Button from "./Button";
import TextInput from "./TextInput";

type ManifestStatusManagerProps = {
  children: ReactNode;
  manifestStatus: ManifestStatus;
  manifestURL: string | null;
};

export default function ManifestManager({ children, manifestStatus, manifestURL }: ManifestStatusManagerProps) {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [input, setInput] = useState('');

  useEffect(() => {
    const manifest = searchParams.get('manifest');
    if (manifest !== null) {
      setInput(manifest);
    }
  }, [setInput, searchParams]);

  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  }, [searchParams]);

  const manifestForm = <form onSubmit={e => {router.push(pathname + '?' + createQueryString('manifest', input))}}>
    <TextInput size={50} value={input} onChange={e => {setInput(e.target.value)}} id="manifest"/>
    <Button type="submit">Play!</Button>
  </form>;

  const resultLoading = <>Loading manifest...</>;
  const resultEmpty = <>
    <div className="text-center">No manifest provided. Please enter the URL of a manifest:</div>
    {manifestForm}
  </>;
  const resultInvalid = <>
    <div className="text-center">Invalid manifest or URL provided. Please try again with the URL of a valid manifest:</div>
    {manifestForm}
  </>;

  const chooseResult = () => {
    if (manifestStatus === ManifestStatus.Empty) {
      if (manifestURL !== null) {
        // Run this ONLY when ManifestStatus.Empty so that fetchManifest doesn't run again AFTER setting state.manifest.url
        dispatch(fetchManifest(manifestURL));
        return resultLoading;
      }
      return resultEmpty;
    } else if (manifestStatus === ManifestStatus.Invalid) {
      return resultInvalid;
    } else if (manifestStatus === ManifestStatus.Loading) {
      return resultLoading;
    } else {
      return <>{children}</>
    }
  }

  return <div className="m-auto w-fit">{chooseResult()}</div>;
}

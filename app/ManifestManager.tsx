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

export default function ManifestManager({ children, manifestStatus, manifestURL, setManifestURL }: any) {

  const dispatch = useAppDispatch();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [input, setInput] = useState('');

  useEffect(() => {
    const newManifestURL = searchParams.get('manifest');
    setManifestURL(newManifestURL);
    if (newManifestURL !== null) {
      setInput(newManifestURL);
      if (newManifestURL !== manifestURL) {
        dispatch(fetchManifest(newManifestURL));
      }
    } else {
      setInput('');
    }
  }, [dispatch, searchParams, manifestURL, setManifestURL]);

  // useCallback to memoize
  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  }, [searchParams]);

  const manifestForm = <form onSubmit={e => {e.preventDefault(); router.push(pathname + '?' + createQueryString('manifest', input))}}>
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

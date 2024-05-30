import { useAppDispatch } from "@/lib/hooks";
import { ManifestStatus, fetchManifest } from "@/lib/manifestSlice";
import { ReactNode } from "react";

type ManifestStatusManagerProps = {
  children: ReactNode;
  manifestStatus: ManifestStatus;
  manifestURL: string | null;
};

export default function ManifestManager({ children, manifestStatus, manifestURL }: ManifestStatusManagerProps) {
  const dispatch = useAppDispatch();
  if (manifestStatus === ManifestStatus.Empty) {
    if (manifestURL !== null) {
      dispatch(fetchManifest(manifestURL));
    }
    return <>No manifest provided!</>;
  } else if (manifestStatus === ManifestStatus.Invalid) {
    return <>Invalid manifest provided!</>;
  } else if (manifestStatus === ManifestStatus.Loading) {
    return <>Loading manifest...</>;
  }

  return <>{children}</>;
}

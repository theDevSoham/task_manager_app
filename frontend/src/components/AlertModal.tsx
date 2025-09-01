import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AlertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  closable?: boolean; // allow closing on outside click or not
};

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  okText = "OK",
  cancelText = "Cancel",
  onOk,
  onCancel,
  closable = true,
}: AlertModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={closable ? onOpenChange : undefined}>
      <AlertDialogContent
        onEscapeKeyDown={(e) => !closable && e.preventDefault()}
        onPointerDown={(e) => !closable && e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel
              onClick={() => {
                onCancel?.();
                if (closable) onOpenChange(false);
              }}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          {okText && (
            <AlertDialogAction
              onClick={() => {
                onOk?.();
                if (closable) onOpenChange(false);
              }}
            >
              {okText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

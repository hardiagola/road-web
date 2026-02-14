import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, X } from 'lucide-react';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutDialog({ open, onOpenChange, onConfirm, onCancel }: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-destructive" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </DialogDescription>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              <LogOut className="h-4 w-4" />
              Yes, Logout
            </Button>
          </div>
        </DialogContent>
    </Dialog>
  );
}

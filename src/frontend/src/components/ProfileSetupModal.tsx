import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Leaf, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { EntityType } from "../backend";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

const MAHARASHTRA_CITIES = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Kolhapur",
];

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [entityType, setEntityType] = useState<EntityType>(EntityType.hotel);
  const { mutateAsync, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city) return;
    try {
      await mutateAsync({
        name: name.trim(),
        city,
        neighborhood: "",
        entityType,
      });
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>Welcome to Left2Lift!</DialogTitle>
          </div>
          <DialogDescription>
            Please complete your profile to get started with food donations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Your City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {MAHARASHTRA_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Your Role</Label>
            <Select
              value={entityType}
              onValueChange={(v) => setEntityType(v as EntityType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EntityType.hotel}>
                  Hotel / Restaurant
                </SelectItem>
                <SelectItem value={EntityType.ngo}>NGO / Food Bank</SelectItem>
                <SelectItem value={EntityType.volunteer}>Volunteer</SelectItem>
                <SelectItem value={EntityType.admin}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            disabled={isPending || !name.trim() || !city}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile & Continue"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

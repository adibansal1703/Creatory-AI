import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  connectAccount,
  disconnectAccount,
  fetchConnectedAccounts,
} from "@/lib/api/connected-accounts";
import { PLATFORMS, PLATFORM_LABELS, type PostPlatform } from "@/lib/types/database";

export function ConnectedAccountsPage() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading, isError, refetch } = useQuery({
    queryKey: ["connected-accounts"],
    queryFn: fetchConnectedAccounts,
  });

  const [connecting, setConnecting] = useState<PostPlatform | null>(null);
  const [accountName, setAccountName] = useState("");

  const connectMutation = useMutation({
    mutationFn: connectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Account connected");
      setConnecting(null);
      setAccountName("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Account disconnected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getAccount = (platform: PostPlatform) =>
    accounts?.find((a) => a.platform === platform && a.is_connected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Connected Accounts</h1>
        <p className="mt-1 text-muted-foreground">
          Link your social profiles before publishing or scheduling content.
        </p>
      </div>

      {isError && (
        <div className="glass rounded-xl p-4 text-sm text-destructive">
          Failed to load accounts.{" "}
          <button className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const connected = getAccount(platform);
          return (
            <div key={platform} className="glass rounded-2xl p-5 border border-border/60">
              <div className="flex items-start justify-between gap-3">
                <PlatformBadge platform={platform} />
                <span
                  className={
                    connected
                      ? "text-xs text-emerald-400 font-medium"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {connected ? "Connected" : "Not connected"}
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-32 mt-4" />
              ) : connected ? (
                <p className="mt-3 text-sm text-muted-foreground">{connected.account_name}</p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Connect your {PLATFORM_LABELS[platform]} account
                </p>
              )}
              <div className="mt-4 flex gap-2">
                {connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass"
                    disabled={disconnectMutation.isPending}
                    onClick={() => disconnectMutation.mutate(platform)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-brand border-0 hover:opacity-90"
                    onClick={() => setConnecting(platform)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={connecting !== null} onOpenChange={(o) => !o && setConnecting(null)}>
        <DialogContent className="glass border-border/60">
          <DialogHeader>
            <DialogTitle>
              Connect {connecting ? PLATFORM_LABELS[connecting] : ""}
            </DialogTitle>
            <DialogDescription>
              Enter your account display name. OAuth tokens will be stored when platform API keys
              are configured in production.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                placeholder="@yourhandle"
                className="glass border-border/60"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-gradient-brand border-0"
              disabled={!accountName.trim() || connectMutation.isPending}
              onClick={() =>
                connecting &&
                connectMutation.mutate({
                  platform: connecting,
                  accountName: accountName.trim(),
                })
              }
            >
              {connectMutation.isPending ? "Connecting…" : "Save connection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

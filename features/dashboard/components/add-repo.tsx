"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDown, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { importPlaygroundFromGitHub } from "@/features/playground/actions"
import { toast } from "sonner"

const AddRepo = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [repository, setRepository] = useState("")
  const [branch, setBranch] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async () => {
    if (!repository.trim()) {
      toast.error("Repository is required")
      return
    }

    setIsImporting(true)
    try {
      const created = await importPlaygroundFromGitHub({
        repository: repository.trim(),
        branch: branch.trim() || undefined,
        accessToken: accessToken.trim() || undefined,
      })

      toast.success(`Imported ${created.importedFileCount} file(s) from ${created.sourceRepo}`)
      setIsOpen(false)
      router.push(`/playground/${created.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import repository"
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <>
      <div
      onClick={() => setIsOpen(true)}
      className="group px-6 py-6 flex flex-row justify-between items-center border border-border/60 rounded-lg bg-card/70 cursor-pointer 
      transition-all duration-300 ease-in-out
      hover:bg-card hover:border-primary/50 hover:scale-[1.02]
      shadow-[0_2px_10px_rgba(0,0,0,0.08)]
      hover:shadow-[0_10px_30px_rgba(126,34,206,0.20)]"
    >
      <div className="flex flex-row justify-center items-start gap-4">
        <Button
          variant={"outline"}
          className="flex justify-center items-center bg-background group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:text-primary transition-colors duration-300"
          size={"icon"}
        >
          <ArrowDown size={30} className="transition-transform duration-300 group-hover:translate-y-1" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-primary">Open Github Repository</h1>
          <p className="text-sm text-muted-foreground max-w-55">Work with your repositories in our editor</p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <Image
          src={"/github.svg"}
          alt="Open GitHub repository"
          width={150}
          height={150}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Import from GitHub</DialogTitle>
            <DialogDescription>
              Import public or private repositories using URL or owner/repo format.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="repo">Repository</Label>
              <Input
                id="repo"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={repository}
                onChange={(event) => setRepository(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="branch">Branch (optional)</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="token">GitHub Token (optional)</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_..."
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Import Repository
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddRepo

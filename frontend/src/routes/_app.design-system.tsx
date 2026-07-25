import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Label } from "@/components/ui/label"
import { BellIcon, Terminal } from "lucide-react"

export const Route = createFileRoute("/_app/design-system")({
  component: DesignSystemPage,
})

function DesignSystemPage() {
  return (
    <div className="container mx-auto py-10 space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground">
          A unified collection of UI components used across DevLink.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Input & Textarea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Type your message here." />
            </div>
          </CardContent>
        </Card>

        {/* Select & Radio */}
        <Card>
          <CardHeader>
            <CardTitle>Select & Radio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Radio Group</Label>
              <RadioGroup defaultValue="option-one">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-one" id="option-one" />
                  <Label htmlFor="option-one">Option One</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-two" id="option-two" />
                  <Label htmlFor="option-two">Option Two</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Checkbox, Badge, Avatar, Chip */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox, Badge, Chip, Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip>React</Chip>
              <Chip onRemove={() => {}}>TypeScript</Chip>
            </div>
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Alert & Toast */}
        <Card>
          <CardHeader>
            <CardTitle>Alert & Toast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                You can add components to your app using the cli.
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={() => {
                toast("Event has been created", {
                  description: "Sunday, December 03, 2023 at 9:00 AM",
                })
              }}
            >
              Show Toast
            </Button>
          </CardContent>
        </Card>

        {/* Dialog & Dropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog & Dropdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open Dropdown</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Tooltip & Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip & Tabs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-10 rounded-full p-0">
                    <BellIcon className="h-4 w-4" />
                    <span className="sr-only">Add to library</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to library</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">Make changes to your account here.</TabsContent>
              <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Pagination & Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Pagination & Skeleton</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Empty State</h2>
        <EmptyState
          title="No projects found"
          description="You haven't created any projects yet. Start building your portfolio."
          action={<Button>Create Project</Button>}
        />
      </div>
    </div>
  )
}

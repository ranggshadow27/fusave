import { login } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button"; // <-- Import komponen interaktif

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            fusave<span className="text-blue-600">.</span>
          </CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk masuk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="•••••••"
                required
              />
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                defaultChecked
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-offset-zinc-950 cursor-pointer"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Ingat Saya
              </Label>
            </div>

            {params?.error && (
              <p className="text-sm font-medium text-destructive">
                {params.error}
              </p>
            )}

            {/* Tombol Interaktif dengan State Pending/Loading */}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

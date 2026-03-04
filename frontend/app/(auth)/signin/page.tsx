"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthAction } from "@/service/auth";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function SignInPage() {
  /**
   * State Variables
   *
   * email: Stores the user's email input.
   * password: Stores the user's password input.
   * showPassword: Toggles the visibility of the password input.
   * isLoading: Indicates if the form submission is in progress.
   * errors: Holds validation error messages for email and password.
   *
   * Functions
   *
   * validateForm: Validates the email and password inputs, setting error messages as needed.
   * handleSubmit: Handles form submission, including validation and simulating an API call.
   *
   * Return JSX
   *
   * Renders the sign-in form with email and password fields, a submit button, and links for forgotten passwords and account creation.
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );


  const router = useRouter();

  // Validate form inputs
  function validateForm() {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = { email, password };
      const resp = await AuthAction.LoginUser(payload);
      
      if (resp.status) {
        const token = resp.data?.token;
        if (token) {
          const secure = window.location.protocol === "https:" ? "; secure" : "";
          document.cookie = `token=${encodeURIComponent(
            token,
          )}; path=/; max-age=604800; samesite=lax${secure}`;
        }

        toast.success(resp.message || "Successfully signed in!");
        // Redirect to dashboard or home page
        setTimeout(() => {
          router.push("/dashboard"); // or wherever you want to redirect
        }, 1000);
      } else {
        // Show error message from API
        toast.error(resp.message || "Sign in failed. Please check your credentials.");
        
        // Set field-specific errors if provided by API
        if (resp.error) {
          if (typeof resp.error === "string") {
            setErrors({ password: resp.error });
          } else {
            setErrors(resp.error);
          }
        } else {
          // General error - clear password field
          setPassword("");
        }
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

const token = AuthAction.GetAuthToken();
console.log(token, 'token');

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Toaster/>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Welcome Back To Tim Tim!
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  required
                  className={`h-11 ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input-foreground"
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-primary! text-sm hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    required
                    className={`h-11 pr-10 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="bg-primary h-11 w-full cursor-pointer text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-foreground text-center text-sm">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="hover:text-primary font-semibold underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="hover:text-primary font-semibold underline"
            >
              Privacy Policy
            </Link>
          </div>

          <Separator />

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-semibold hover:underline"
              tabIndex={isLoading ? -1 : 0}
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AuthAction } from "@/service/auth";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState(0);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (strength < 3) {
      newErrors.password = "Password is too weak";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "password") {
      checkPasswordStrength(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const resp = await AuthAction.RegisterUser(formData);
      if (resp.status) {
toast.success(
  (resp.message ? resp.message + " " : "") +
  "Please check your email and verify your account."
);
        // router.push("/signin");
        return;
      }
      toast.error(resp.message || "Registration failed");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get color for password strength meter
  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Toaster />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Create Account
          </CardTitle>
          <CardDescription className="text-foreground text-center">
            Fill in your details to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`bg-input h-11 ${
                    errors.fullName
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input-foreground"
                  }`}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`bg-input h-11 ${
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

              {/* Role Selection Field */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Select Role
                </Label>
                <Select
                  onValueChange={(value) => handleChange("role", value)}
                  value={formData.role}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`bg-input h-11 ${
                      errors.role
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                  >
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="TRANSPORT_MANAGER"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Transport Manager</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="STANDALONE_USER"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Standalone User</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-destructive text-sm">{errors.role}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`bg-input h-11 pr-10 ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input-foreground"
                    }`}
                    disabled={isLoading}
                    autoComplete="new-password"
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

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i <= strength ? getStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-foreground grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            formData.password.length >= 8
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            /[A-Z]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            /[0-9]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Number</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check
                          className={`h-3 w-3 ${
                            /[^A-Za-z0-9]/.test(formData.password)
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                        <span>Special</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex w-full items-start space-x-2 font-light">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                required
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm font-normal!">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary font-medium hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="bg-primary h-11 w-full cursor-pointer text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Separator />

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-primary font-semibold hover:underline"
              tabIndex={isLoading ? -1 : 0}
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

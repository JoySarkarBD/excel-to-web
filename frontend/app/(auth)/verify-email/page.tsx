"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AuthAction } from "@/service/auth";
import { ArrowRight, CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [showContent, setShowContent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get and decode parameters
  const rawEmail = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  
  // Decode email (handles %40 and other encoded characters)
  const email = decodeURIComponent(rawEmail);

  useEffect(() => {
    // Small delay for entrance animation
    setTimeout(() => setShowContent(true), 100);

    const verifyEmail = async () => {
      // Check if parameters exist
      if (!email || !token) {
        setStatus("error");
        setMessage("Invalid verification link. Missing email or token.");
        return;
      }

      try {
        // Call your verification API
        const response = await AuthAction.VerifyEmail({ email, token });
        
        if (response.status) {
          setStatus("success");
          setMessage(response.message || "Email verified successfully!");
          toast.success("Email verified successfully!");
          
          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push("/signin");
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setStatus("error");
          setMessage(response.message || "Verification failed. Please try again.");
          toast.error(response.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [email, token, router]);

  // Resend verification email handler
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }

    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }

    setIsResending(true);
    try {
      const response = await AuthAction.ResendVerificationEmail({ email });
      
      if (response.status) {
        toast.success(response.message || "Verification email sent successfully!");
        
        // Set cooldown to prevent spam (60 seconds)
        setResendCooldown(60);
        
        // Start cooldown timer
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || "Failed to resend verification email");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Toaster richColors position="top-center" />
      
      <div
        className={`w-full max-w-md transition-all duration-500 transform ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Card className="w-full  overflow-hidden border-0">
          {/* Animated gradient border */}
          <div className="relative h-1.5 w-full overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient" />
          </div>
          
          <CardHeader className="space-y-2 pb-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-900/20 animate-bounce-slow">
                <Mail className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            
            <CardTitle className="text-center text-2xl font-bold">
              Email Verification
            </CardTitle>
            
            {email && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Verifying <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </p>
            )}
          </CardHeader>

          <CardContent className="pb-6">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Status Icon with Animation */}
              <div className="relative">
                {status === "loading" && (
                  <div className="rounded-full bg-blue-50 p-4 dark:bg-blue-900/20">
                    <Loader2 className="h-12 w-12 animate-spin-slow text-blue-500" />
                  </div>
                )}
                
                {status === "success" && (
                  <div className="rounded-full bg-green-50 p-4 dark:bg-green-900/20 animate-pop">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                )}
                
                {status === "error" && (
                  <div className="rounded-full bg-red-50 p-4 dark:bg-red-900/20 animate-shake">
                    <XCircle className="h-12 w-12 text-red-500" />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {status === "loading" && "Verifying your email..."}
                  {status === "success" && "Email Verified!"}
                  {status === "error" && "Verification Failed"}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message || (status === "loading" && "Please wait while we verify your email address.")}
                </p>
              </div>

              {/* Success Countdown */}
              {status === "success" && countdown > 0 && (
                <div className="text-center w-full">
                  <p className="text-sm text-gray-500">
                    Redirecting to sign in in {countdown} seconds...
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-1000 linear"
                      style={{ width: `${(countdown / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            {/* Action Buttons */}
            {status === "success" && (
              <div className="w-full">
                <Button 
                  onClick={() => router.push("/signin")}
                  className="bg-primary h-11 w-full text-base cursor-pointer group transition-all duration-300 hover:scale-105"
                >
                  Go to Sign In
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="w-full space-y-2">
                <Button 
                  onClick={() => router.push("/signup")}
                  className="bg-primary h-11 w-full text-base cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  Back to Sign Up
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
{                  `  Didn't receive the email?`}
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending || resendCooldown > 0}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {status === "loading" && (
              <p className="text-center text-sm text-gray-500">
                This may take a few seconds...
              </p>
            )}

            {/* Help Link */}
            {(status === "error" || status === "success") && (
              <p className="text-center text-xs text-gray-400">
                Need help?{" "}
                <Link href="/support" className="text-gray-500 hover:underline hover:text-gray-700 transition-colors">
                  Contact support
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Add custom CSS animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pop {
          0% { transform: scale(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-gradient {
          animation: gradient 2s infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }
        
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .linear {
          transition-timing-function: linear;
        }
      `}</style>
    </div>
  );
}

import React from 'react';

const VerifyEmailPage = () => {
  return (

 <Suspense fallback={<span>Loading....</span>}>
       <VerifyEmail/>
 </Suspense>

  );
};

export default VerifyEmailPage;
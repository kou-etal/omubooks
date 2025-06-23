<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'すでに認証済みです。']);
        }

        $request->user()->markEmailAsVerified();
    event(new \Illuminate\Auth\Events\Verified($request->user()));

        return response()->json(['message' => 'メール認証が完了しました。']);
    }
}

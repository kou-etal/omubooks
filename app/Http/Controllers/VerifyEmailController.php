<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Access\AuthorizationException;
use App\Models\User;

class VerifyEmailController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // IDとhashからユーザー取得
        $user = User::findOrFail($request->route('id'));

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            throw new AuthorizationException();
        }

       if ($user->hasVerifiedEmail()) {
    return response()->json(['message' => 'Email has already been verified.']);
}

$user->markEmailAsVerified();
event(new Verified($user));

return response()->json(['message' => 'Email verification completed successfully.']);

    }
}


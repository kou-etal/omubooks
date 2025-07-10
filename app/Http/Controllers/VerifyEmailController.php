<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Auth\Events\Verified;

class VerifyEmailController
{
    public function __invoke(Request $request)
    {
        if (! URL::hasValidSignature($request)) {
            return response()->json(['message' => '署名が無効または期限切れです。'], 403);
        }

        $user = User::findOrFail($request->route('id'));

        if (! hash_equals(sha1($user->getEmailForVerification()), $request->route('hash'))) {
            return response()->json(['message' => 'ハッシュが一致しません。'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'すでに認証済みです。']);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json(['message' => 'メール認証が完了しました。']);
    }
}


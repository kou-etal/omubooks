<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class RegisterApiController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $v = $request->validated();

        $user = User::create([
            'name'     => $v['name'],
            'email'    => $v['email'],
            'password' => Hash::make($v['password']),
        ]);

        // メール認証通知（MustVerifyEmail 実装ユーザーなら自動）
        event(new Registered($user));

        // 必要なら自動ログイン
        Auth::login($user);

        return response()->json([
            'message' => '確認メールを送信しました。',
            'user'    => new UserResource($user),
        ], 201);
    }
}


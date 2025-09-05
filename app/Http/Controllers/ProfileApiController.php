<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Profile\ProfileUpdateRequest;
use App\Http\Requests\Profile\UploadImageRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileApiController extends Controller
{
    /** ログイン */
    public function login(LoginRequest $request)
    {
        $v = $request->validated();

        $user = \App\Models\User::where('email', $v['email'])->first();

        if (!$user || !Hash::check($v['password'], $user->password)) {
            return response()->json(['message' => 'メールアドレスまたはパスワードが違います'], 401);
        }

        Auth::login($user);

        return response()->json([
            'message' => 'ログイン成功',
            'user'    => new UserResource($user),
        ]);
    }

    /** 自分のプロフィール（編集画面用データ） */
    public function edit()
    {
        return response()->json([
            'user' => new UserResource(Auth::user()),
        ]);
    }

    /** ログアウト */
    public function logout()
    {
        Auth::logout();

        // セッションAPIなら（SPA想定）
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return response()->json(['message' => 'ログアウト成功']);
    }

    /** プロフィール更新（学部・学科・PayPay ID・自己紹介・表示名） */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $v    = $request->validated();

        // emailはここでは更新しない（Register/Email Verifyの領域）
        $user->fill([
            'name'        => $v['name']        ?? $user->name,
            'bio'         => $v['bio']         ?? $user->bio,
            'faculty'     => $v['faculty']     ?? $user->faculty,
            'paypay_id'   => $v['paypay_id']   ?? $user->paypay_id,
        ])->save();

        return response()->json([
            'message' => 'プロフィールを更新しました',
            'user'    => new UserResource($user),
        ]);
    }

    /** プロフィール画像アップロード */
    public function uploadImage(UploadImageRequest $request)
    {
        $path = $request->file('image')->store('profile_images', 'public');

        $user = $request->user();
        $user->profile_image = config('app.url') . '/storage/' . $path; // 絶対URLで保存
        $user->save();

        return response()->json([
            'message'        => 'プロフィール画像を更新しました',
            'profile_image'  => $user->profile_image,
            'user'           => new UserResource($user),
        ]);
    }

    /** 自分の情報（/me） */
    public function showMe()
    {
        return new UserResource(Auth::user());
    }
}

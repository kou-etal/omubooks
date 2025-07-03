<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class ProfileApiController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'ユーザーネームまたはパスワードが間違っています'], 401);
        }
     Auth::login($user);
        return response()->json(['message' => 'ログイン成功', 'user' => $user]);
    }
    public function edit(Request $request){
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(){
        dd(Auth::user());
        Auth::logout();
        return response()->json(['message' => 'ログアウト成功']);
    }
    public function update(ProfileUpdateRequest $request)
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return response()->json([
            'message'=>'更新しました'
        ]);
    }

    public function destroy(Request $request){
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message'=>'削除しました'
        ]);
    }
    public function index()
    {
        return response()->json(
        User::select('id', 'name')->get()  // 必要なフィールドだけ返す
    );
    }
         public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateIntroduction(Request $request)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'bio' => 'nullable|string',
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json(['message' => 'プロフィールを更新しました']);
    }



    public function uploadImage(Request $request)
{
    $request->validate([
        'image' => 'required|image|max:5000',
    ]);

    $path = $request->file('image')->store('profile_images', 'public');

    $user = $request->user();
    $user->profile_image = config('app.url') . '/storage/' . $path; //絶対URL
    $user->save();

    return response()->json(['profile_image' => $user->profile_image], 200);
}

/*public function uploadImage(Request $request)
{
    $request->validate([
        'image' => 'required|image|max:2048',
    ]);

    $path = $request->file('image')->store('profile_images', 'public');

    $user = $request->user();
    $user->profile_image = '/storage/' . $path;
    $user->save();

    return response()->json(['profile_image' => $user->profile_image], 200);
}*/
}



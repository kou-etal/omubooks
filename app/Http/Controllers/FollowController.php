<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Follow;
use App\Models\User;

class FollowController extends Controller
{


    public function index(Request $request)
{
    $user = $request->user();
    $followings = $user->followings()->pluck('users.id'); // [2, 5, 9, ...]
    return response()->json($followings);
}
     public function follow($userId)
    {
        auth()->user()->followings()->syncWithoutDetaching([$userId]);
        return response()->json(['status' => 'followed']);
    }

    public function unfollow($userId)
    {
        auth()->user()->followings()->detach($userId);
        return response()->json(['status' => 'unfollowed']);
    }

    public function isFollowing($userId)
    {
        $isFollowing = auth()->user()->followings()->where('followed_id', $userId)->exists();
        return response()->json(['following' => $isFollowing]);
    }
    public function followingsUsers(Request $request)
{
    $user = $request->user();

    $users = User::whereIn('id', function ($query) use ($user) {
        $query->select('followed_id')
              ->from('follows')
              ->where('follower_id', $user->id);
    })->get(['id', 'name']);

    return response()->json($users);
}

}

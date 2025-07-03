<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Post;
use App\Models\Like;
use App\Models\Follow;
use App\Models\PostImage;

class PostApiController extends Controller
{


    public function index()
{
   $userId = Auth::id(); // 今ログインしてるユーザーID

    $posts = Post::with(['user:id,name,profile_image', 'images', 'likes'])
                ->latest()
                ->get()
                ->map(function ($post) use ($userId) {
                    return [
                        'id' => $post->id,
                        'body' => $post->body,
                        'user' => $post->user,
                        'images' => $post->images,
                        'likes_count' => $post->likes->count(),
                        'liked_by_me' => $post->likes->contains('user_id', $userId),
                        'created_at' => $post->created_at->toDateTimeString(),
                    ];
                });

    return response()->json($posts);
}
 public function store(Request $request)
{
    $request->validate([
        'text' => 'nullable|string|max:1000',
        'images.*' => 'image|max:5000',
    ]);

    $user = $request->user();

    $post = Post::create([
        'user_id' => $user->id,
        'body' => $request->input('text'),
    ]);

    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $image) {
            $path = $image->store('post_images', 'public');
            PostImage::create([
                'post_id' => $post->id,
                'path' => config('app.url') . '/storage/' . $path, // 絶対URLで返す
            ]);
        }
    }

    return response()->json(['message' => '投稿完了', 'post' => $post->load('images')], 201);
}
public function following()
{
    $user = Auth::user();

    // フォロー中のユーザーの ID 一覧
    $followingIds = $user->followings()->pluck('users.id');

    // そのユーザーたちの投稿を取得
    $posts = Post::with(['user:id,name,profile_image', 'images', 'likes'])
                ->whereIn('user_id', $followingIds)
                ->latest()
                ->get()
                ->map(function ($post) use ($user) {
                    return [
                        'id' => $post->id,
                        'body' => $post->body,
                        'user' => $post->user,
                        'images' => $post->images,
                        'likes_count' => $post->likes->count(),
                        'liked_by_me' => $post->likes->contains('user_id', $user->id),
                        'created_at' => $post->created_at->toDateTimeString(),
                    ];
                });

    return response()->json($posts);
}
public function like(Post $post, Request $request)
    {
        $userId = $request->user()->id;

        $like = Like::where('post_id', $post->id)
                    ->where('user_id', $userId)
                    ->first();

        if ($like) {
            $like->delete();
            return response()->json(['liked' => false]);
        } else {
            Like::create([
                'post_id' => $post->id,
                'user_id' => $userId,
            ]);
            return response()->json(['liked' => true]);
        }
    }
}
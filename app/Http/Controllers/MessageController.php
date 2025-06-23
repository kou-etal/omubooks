<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Message;

class MessageController extends Controller
{
public function index($targetUserId)
{
    $userId = auth()->id();
    $messages = Message::where(function ($q) use ($userId, $targetUserId) {
        $q->where('from_user_id', $userId)->where('to_user_id', $targetUserId);
    })->orWhere(function ($q) use ($userId, $targetUserId) {
        $q->where('from_user_id', $targetUserId)->where('to_user_id', $userId);
    })->orderBy('created_at')->get();

    return response()->json($messages);
}
}
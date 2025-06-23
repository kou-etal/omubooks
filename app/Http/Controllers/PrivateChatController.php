<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Events\PrivateMessageSent;
use App\Models\Message;
use App\Models\User;

class PrivateChatController extends Controller
{
    public function send(Request $request)
    {
        $message = $request->input('input');
        $toUserId = $request->input('targetUserId');
        $fromUserId = auth()->id();

         Message::create([
        'from_user_id' => auth()->id(),
        'to_user_id' => $toUserId,
        'message' => $message,
    ]);

        event(new PrivateMessageSent($message, $fromUserId, $toUserId));
        $senderName= User::find($fromUserId)?->name ?? '不明なユーザー';
        Http::post(env('SLACK_WEBHOOK_URL'), [
        'text' => "{$senderName}さんからメッセージが届きました：\n{$message}",
    ]);

        return response()->json(['status' => 'Message sent!']);
    }
}

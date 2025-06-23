<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GroupMessage;
use App\Events\GroupMessageSent;

class GroupChatController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'message' => 'required|string|max:1000',
        ]);

        $message = GroupMessage::create([
            'group_id' => $request->group_id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        event(new GroupMessageSent($message->group_id, $message->user_id, $message->message));

        return response()->json(['status' => 'Message sent!']);
    }
  

public function history($groupId)
{
    $messages = GroupMessage::where('group_id', $groupId)
        ->with('user:id,name,profile_image') // 必要最低限のユーザー情報だけ
        ->orderBy('created_at')
        ->get();

    return response()->json($messages);
}

}

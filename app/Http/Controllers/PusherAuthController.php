<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Pusher\Pusher;

class PusherAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        // ユーザーがログインしてるかチェック
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 403);
        }

        $pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            [
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                'useTLS' => true,
            ]
        );

        // channel名とsocket_idはPusher.jsから送られてくる
        $auth = $pusher->authorizeChannel(
            $request->input('channel_name'),
            $request->input('socket_id')
        );

        return response($auth);
    }
}
